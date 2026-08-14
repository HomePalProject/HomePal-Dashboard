export interface LocalizedValue {
  culture: string;
  value: string;
}

export interface MeasuringUnit {
  id: string;
  name: string | LocalizedValue[] | any;
  symbol?: string | LocalizedValue[] | any;
  createdAt?: string;
}

export interface CreateMeasuringUnitPayload {
  name: LocalizedValue[];
  symbol: LocalizedValue[];
}

export interface UpdateMeasuringUnitPayload {
  name: LocalizedValue[];
  symbol: LocalizedValue[];
}
