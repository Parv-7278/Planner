import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Booking, QueueEntry, DayItinerary, UserProfile } from '../types';

export class SupabaseSyncService {
  /**
   * AUTHENTICATION HELPERS
   */
  static async signUp(email: string, password: string, name?: string) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Add credentials to .env first.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] }
      }
    });
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Add credentials to .env first.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static onAuthStateChange(callback: (user: any) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }

  /**
   * BOOKINGS CLOUD SYNC
   */
  static async fetchBookings(): Promise<Booking[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ [DAYLY Supabase] Error loading bookings:', error.message);
        return [];
      }

      return (data || []).map((b: any) => ({
        id: b.id,
        experienceId: b.experience_id,
        experienceName: b.experience_name,
        category: (b.category || 'food') as any,
        venueName: b.experience_name,
        venueAddress: b.venue_address || 'Delhi NCR',
        date: b.date,
        timeSlot: b.slot_time,
        numPeople: b.party_size || 2,
        totalAmount: Number(b.amount_paid) || 0,
        bookingCode: b.id.slice(0, 8).toUpperCase(),
        status: (b.status || 'confirmed') as any,
        qrCodeUrl: b.qr_code || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DAYLY-${b.id}`,
        createdAt: b.created_at || new Date().toISOString(),
        cancellationPolicy: 'Free cancellation up to 2 hours before.',
        attendeeName: 'Explorer',
        attendeeEmail: 'user@example.com',
        attendeePhone: '+91 98765 43210'
      }));
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Failed to fetch bookings from cloud:', err);
      return [];
    }
  }

  static async syncBooking(booking: Booking): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const user = await this.getCurrentUser();
      const payload: Record<string, any> = {
        id: booking.id,
        experience_id: booking.experienceId,
        experience_name: booking.experienceName,
        category: booking.category,
        slot_time: booking.timeSlot,
        date: booking.date,
        party_size: booking.numPeople,
        amount_paid: booking.totalAmount,
        status: booking.status,
        qr_code: booking.qrCodeUrl
      };
      if (user?.id) payload.user_id = user.id;

      const { error } = await supabase.from('bookings').upsert(payload);
      if (error) console.warn('⚠️ [DAYLY Supabase] Upsert booking failed:', error.message);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Sync booking exception:', err);
    }
  }

  /**
   * VIRTUAL QUEUES CLOUD SYNC
   */
  static async fetchQueues(): Promise<QueueEntry[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('virtual_queues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ [DAYLY Supabase] Error loading queues:', error.message);
        return [];
      }

      return (data || []).map((q: any) => ({
        id: q.id,
        experienceId: q.experience_id,
        experienceName: q.experience_name,
        experienceImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
        venueName: q.experience_name,
        slotTime: q.slot_time,
        slotDate: q.date,
        partySize: q.party_size || 2,
        currentPosition: q.current_position || 1,
        initialPosition: q.initial_position || 1,
        estimatedWaitMinutes: q.estimated_wait_minutes || 0,
        status: q.status || 'monitoring',
        monitoringStatus: q.monitoring_status || 'in_queue',
        autoBook: false,
        joinedAt: q.created_at || new Date().toISOString(),
        assistantEnabled: q.assistant_enabled ?? true,
        autoQueueEntry: q.auto_queue_entry ?? true,
        requiresManualVerification: q.requires_manual_verification ?? false,
        requiresPaymentApproval: q.requires_payment_approval ?? false,
        openingTime: q.scheduled_opening_time || q.opening_time || undefined,
        logs: Array.isArray(q.logs) ? q.logs : []
      }));
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Failed to fetch queues from cloud:', err);
      return [];
    }
  }

  static async syncQueue(queue: QueueEntry): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const user = await this.getCurrentUser();
      const payload: Record<string, any> = {
        id: queue.id,
        experience_id: queue.experienceId,
        experience_name: queue.experienceName,
        slot_time: queue.slotTime,
        date: queue.slotDate,
        party_size: queue.partySize,
        status: queue.status,
        monitoring_status: queue.monitoringStatus || 'in_queue',
        current_position: queue.currentPosition,
        initial_position: queue.initialPosition,
        estimated_wait_minutes: queue.estimatedWaitMinutes,
        assistant_enabled: queue.assistantEnabled ?? true,
        auto_queue_entry: queue.autoQueueEntry ?? true,
        requires_manual_verification: queue.requiresManualVerification ?? false,
        requires_payment_approval: queue.requiresPaymentApproval ?? false,
        scheduled_opening_time: queue.openingTime || null,
        logs: queue.logs || [],
        updated_at: new Date().toISOString()
      };
      if (user?.id) payload.user_id = user.id;

      const { error } = await supabase.from('virtual_queues').upsert(payload);
      if (error) console.warn('⚠️ [DAYLY Supabase] Upsert queue failed:', error.message);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Sync queue exception:', err);
    }
  }

  static async removeQueue(queueId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('virtual_queues').delete().eq('id', queueId);
      if (error) console.warn('⚠️ [DAYLY Supabase] Delete queue failed:', error.message);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Remove queue exception:', err);
    }
  }

  /**
   * SAVED ITINERARIES CLOUD SYNC
   */
  static async fetchSavedItineraries(): Promise<DayItinerary[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('saved_itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ [DAYLY Supabase] Error loading itineraries:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        city: 'Delhi NCR',
        totalCost: Number(row.estimated_cost) || 0,
        userBudget: Number(row.total_budget) || 0,
        numPeople: row.num_people || 2,
        items: Array.isArray(row.items) ? row.items : [],
        travelLegs: [],
        totalDurationMinutes: 360,
        totalDistanceKm: 12.5,
        numActivities: Array.isArray(row.items) ? row.items.length : 0,
        numBookings: 0,
        mode: 'custom',
        createdAt: row.created_at || new Date().toISOString()
      }));
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Failed to fetch itineraries from cloud:', err);
      return [];
    }
  }

  static async syncItinerary(itinerary: DayItinerary): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const user = await this.getCurrentUser();
      const payload: Record<string, any> = {
        id: itinerary.id,
        title: itinerary.title,
        date: itinerary.date,
        total_budget: itinerary.userBudget || itinerary.totalCost,
        estimated_cost: itinerary.totalCost,
        actual_spent: 0,
        num_people: itinerary.numPeople || 2,
        items: itinerary.items || [],
        updated_at: new Date().toISOString()
      };
      if (user?.id) payload.user_id = user.id;

      const { error } = await supabase.from('saved_itineraries').upsert(payload);
      if (error) console.warn('⚠️ [DAYLY Supabase] Upsert itinerary failed:', error.message);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Sync itinerary exception:', err);
    }
  }

  /**
   * WISHLIST CLOUD SYNC
   */
  static async fetchWishlist(): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('experience_id');

      if (error) {
        console.warn('⚠️ [DAYLY Supabase] Error loading wishlist:', error.message);
        return [];
      }

      return (data || []).map((w: any) => w.experience_id);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Failed to fetch wishlist from cloud:', err);
      return [];
    }
  }

  static async syncWishlistToggle(experienceId: string, isAdded: boolean): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const user = await this.getCurrentUser();
      if (isAdded) {
        const payload: Record<string, any> = {
          id: `wish-${experienceId}-${user?.id || 'anon'}`,
          experience_id: experienceId
        };
        if (user?.id) payload.user_id = user.id;
        await supabase.from('wishlist_items').upsert(payload);
      } else {
        await supabase.from('wishlist_items').delete().eq('experience_id', experienceId);
      }
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Sync wishlist toggle exception:', err);
    }
  }

  /**
   * USER PROFILE CLOUD SYNC
   */
  static async fetchProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name || 'Explorer',
        email: data.email || user.email || '',
        avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        savedPlaces: ['Mehrauli', 'Hauz Khas', 'Connaught Place'],
        wishlistIds: [],
        preferredCity: data.city || 'Delhi NCR',
        preferredCategories: (data.preferred_categories || ['food', 'workshops', 'movies']) as any,
        budgetTier: (data.budget_tier as any) || 'moderate',
        dietaryPreference: 'Vegetarian friendly'
      };
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Failed to fetch profile from cloud:', err);
      return null;
    }
  }

  static async syncProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) return;

      const payload: Record<string, any> = {
        id: user.id,
        email: profile.email || user.email,
        name: profile.name,
        avatar_url: profile.avatar,
        city: profile.preferredCity,
        budget_tier: profile.budgetTier,
        preferred_categories: profile.preferredCategories,
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').upsert(payload);
    } catch (err) {
      console.warn('⚠️ [DAYLY Supabase] Sync profile exception:', err);
    }
  }
}
