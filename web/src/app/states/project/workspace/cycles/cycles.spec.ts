import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cycles } from './cycles';

describe('Cycles', () => {
  let component: Cycles;
  let fixture: ComponentFixture<Cycles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cycles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cycles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
