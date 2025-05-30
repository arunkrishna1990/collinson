export enum Operator {
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  EQUALS = 'equals',
}

export type ActivityCondition = {
  field: string
  operator: Operator
  value: number
  weight: number
  reason: string
}

export enum ActivityType {
  SKIING = 'skiing',
  SURFING = 'surfing',
  OUTDOOR_SIGHTSEEING = 'outdoor_sightseeing',
  INDOOR_SIGHTSEEING = 'indoor_sightseeing',
}

export interface ActivityForecastConfig {
  activity: ActivityType
  conditions: ActivityCondition[]
}

export interface IActivityScoreConfigDAO {
  getConfig(): ActivityForecastConfig[];
}

// Ideally this will be replaced with a database that contains the configurations for different activities. 
// The advantage is that it can be easily extended to support more activities and conditions without changing the codebase.
export class ActivityScoreConfigDAO implements IActivityScoreConfigDAO {

  public getConfig(): ActivityForecastConfig[] {
    return [{
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'sunshine',
          operator: Operator.GREATER_THAN,
          value: 36000,
          weight: 1,
          reason: 'High sunshine hours are ideal for outdoor sightseeing',
        },
      ],
    },];
  }
}