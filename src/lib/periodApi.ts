import { supabase } from './supabase';
import { PeriodLog, DailyHealthLog, PeriodSettings } from '../types/period';

const PERIOD_NOTE_TITLE = 'system_period_tracker_data';
const DAILY_LOGS_TITLE = 'system_period_daily_logs';
const SETTINGS_TITLE = 'system_period_settings';

export async function getPeriodLogs(coupleId: string): Promise<PeriodLog[]> {
  if (!coupleId) return [];
  const { data, error } = await supabase
    .from('shared_notes')
    .select('content')
    .eq('couple_id', coupleId)
    .eq('title', PERIOD_NOTE_TITLE)
    .single();

  if (error || !data?.content) return [];
  try { return JSON.parse(data.content) as PeriodLog[]; } catch (e) { return []; }
}

export async function savePeriodLogs(coupleId: string, userId: string, logs: PeriodLog[]): Promise<boolean> {
  return await upsertSystemNote(coupleId, userId, PERIOD_NOTE_TITLE, logs);
}

export async function getDailyHealthLogs(coupleId: string): Promise<DailyHealthLog[]> {
  if (!coupleId) return [];
  const { data, error } = await supabase
    .from('shared_notes')
    .select('content')
    .eq('couple_id', coupleId)
    .eq('title', DAILY_LOGS_TITLE)
    .single();

  if (error || !data?.content) return [];
  try { return JSON.parse(data.content) as DailyHealthLog[]; } catch (e) { return []; }
}

export async function saveDailyHealthLogs(coupleId: string, userId: string, logs: DailyHealthLog[]): Promise<boolean> {
  return await upsertSystemNote(coupleId, userId, DAILY_LOGS_TITLE, logs);
}

export async function getPeriodSettings(coupleId: string): Promise<PeriodSettings> {
  const defaultSettings: PeriodSettings = {
    typicalCycleLength: 28,
    typicalPeriodLength: 5,
    shareWithPartner: 'none',
    updatedAt: new Date().toISOString()
  };

  if (!coupleId) return defaultSettings;
  const { data, error } = await supabase
    .from('shared_notes')
    .select('content')
    .eq('couple_id', coupleId)
    .eq('title', SETTINGS_TITLE)
    .single();

  if (error || !data?.content) return defaultSettings;
  try { 
    return { ...defaultSettings, ...(JSON.parse(data.content) as Partial<PeriodSettings>) }; 
  } catch (e) { return defaultSettings; }
}

export async function savePeriodSettings(coupleId: string, userId: string, settings: PeriodSettings): Promise<boolean> {
  return await upsertSystemNote(coupleId, userId, SETTINGS_TITLE, settings);
}

async function upsertSystemNote(coupleId: string, userId: string, title: string, contentData: any): Promise<boolean> {
  if (!coupleId || !userId) return false;
  const content = JSON.stringify(contentData);

  const { data: existing } = await supabase
    .from('shared_notes')
    .select('id')
    .eq('couple_id', coupleId)
    .eq('title', title)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('shared_notes')
      .update({ content, updated_by: userId, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return !error;
  } else {
    const { error } = await supabase.from('shared_notes').insert({
      couple_id: coupleId,
      title,
      category: 'system_data',
      content,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return !error;
  }
}

