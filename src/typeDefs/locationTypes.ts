export interface GovernorateResponse {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  citiesCount: number;
}

export interface CityResponse {
  id: string;
  name: string;
  governorateId: string;
  governorateCode: string;
  governorateName: string;
  latitude: number;
  longitude: number;
}
