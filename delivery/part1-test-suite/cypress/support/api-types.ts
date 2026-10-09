export interface Room {
  roomid: number; roomName: string; type: string; accessible: boolean;
  image: string; description: string; features: string[]; roomPrice: number;
}
export interface Dates { checkin: string; checkout: string }
export interface BookingIdentity {
  roomid: number; firstname: string; lastname: string;
  depositpaid: boolean; bookingdates: Dates;
}
export interface BookingRequest extends BookingIdentity { email: string; phone: string }
export interface BookingCreated extends BookingIdentity { bookingid: number }
export interface SafeResponse {
  status: number; booking?: BookingCreated; errors?: string[];
  error?: string; contactFieldsAbsent?: boolean;
}
export interface CleanupOutcome {
  bookingid: number | null; marker: string; outcome: string;
  status?: number; classification: 'unknown' | 'not-applicable';
}
