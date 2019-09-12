import { TestBed } from '@angular/core/testing';

import { CampaignFormService } from './campaign-form.service';

describe('CampaignFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CampaignFormService = TestBed.get(CampaignFormService);
    expect(service).toBeTruthy();
  });
});
