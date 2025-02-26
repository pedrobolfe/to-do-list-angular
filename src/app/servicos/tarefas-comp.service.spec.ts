import { TestBed } from '@angular/core/testing';

import { TarefasCompService } from './tarefas-comp.service';

describe('TarefasCompService', () => {
  let service: TarefasCompService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TarefasCompService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
