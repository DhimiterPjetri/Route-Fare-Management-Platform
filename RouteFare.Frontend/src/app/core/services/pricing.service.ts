import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  PricingDto, 
  UpdatePricingDto, 
  PricingFilterDto 
} from '../models/pricing/pricing.model';
import { PricingTableDto } from '../models/pricing/pricing-table.model';
import { BulkPricingUpdateDto } from '../models/pricing/bulk-pricing.model';
import { PagedResult } from '../models/common/api.model';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  constructor(private apiService: ApiService) {}

  getPricing(filter?: PricingFilterDto): Observable<PagedResult<PricingDto>> {
    return this.apiService.get<PagedResult<PricingDto>>('Pricing', filter);
  }

  getPricingTable(tourOperatorRouteId: number): Observable<PricingTableDto> {
    return this.apiService.get<PricingTableDto>(`Pricing/table/${tourOperatorRouteId}`);
  }

  updatePricing(pricing: UpdatePricingDto): Observable<string> {
    return this.apiService.putText('Pricing', pricing);
  }

  bulkUpdatePricing(bulkUpdate: BulkPricingUpdateDto): Observable<string> {
    return this.apiService.putText('Pricing/bulk', bulkUpdate);
  }
}