import { User } from "types/user";

export interface AdaptiveCardMessage {
  id: number;
  card_message: string;
  user_id: number;
  user?: User;
  created_at: Date;
}
