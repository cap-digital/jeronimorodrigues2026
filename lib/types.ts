/* Formatos retornados pela função Supabase JeronimoRod2026 */

export interface MetaRow {
  date: string;
  campaign: string;
  adset_name: string;
  ad_name: string;
  age: string;
  gender: string;
  thumbnail_url: string;
  instagram_permalink_url: string;
  spend: number | string;
  clicks: number | string;
  impressions: number | string;
  reach: number | string;
  video_play_actions_video_view: number | string;
  video_thruplay_watched_actions_video_view: number | string;
  video_p25_watched_actions_video_view: number | string;
  video_p50_watched_actions_video_view: number | string;
  video_p75_watched_actions_video_view: number | string;
  video_p95_watched_actions_video_view: number | string;
  video_p100_watched_actions_video_view: number | string;
  actions_post_engagement: number | string;
  actions_comment: number | string;
  actions_onsite_conversion_post_save: number | string;
  actions_post_reaction: number | string;
  actions_post: number | string;
  instagram_profile_visits: number | string;
}

export interface PlacementRow {
  date: string;
  campaign: string;
  spend: number | string;
  clicks: number | string;
  impressions: number | string;
  reach: number | string;
  video_play_actions_video_view: number | string;
  video_thruplay_watched_actions_video_view: number | string;
  video_p25_watched_actions_video_view: number | string;
  video_p50_watched_actions_video_view: number | string;
  video_p75_watched_actions_video_view: number | string;
  video_p95_watched_actions_video_view: number | string;
  video_p100_watched_actions_video_view: number | string;
  actions_post_engagement: number | string;
  actions_comment: number | string;
  actions_onsite_conversion_post_save: number | string;
  actions_post_reaction: number | string;
  actions_post: number | string;
  instagram_profile_visits: number | string;
  platform_position: string;
  publisher_platform: string;
}

export interface InsightsResponse {
  success: boolean;
  meta: MetaRow[];
  meta_placement: PlacementRow[];
  timestamp: string;
}

/* Único filtro global: período (intervalo de datas inclusivo).
   null/null = todo o período disponível. */
export interface Period {
  from: string | null; // yyyy-mm-dd
  to: string | null; // yyyy-mm-dd
}

export const ALL_PERIOD: Period = { from: null, to: null };
