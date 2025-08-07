import { AdaptiveCardMessage } from './index';

export interface AdaptiveCardMessageResponse {
  data: AdaptiveCardMessage | AdaptiveCardMessage[];
  message?: string;
}

export type GetAdaptiveCardMessagesResponse = {
  data: AdaptiveCardMessage[];
};

export type GetAdaptiveCardMessagesByTypeResponse = {
  data: AdaptiveCardMessage[];
};