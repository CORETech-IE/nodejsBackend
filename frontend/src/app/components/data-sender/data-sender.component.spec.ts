import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSenderComponent } from './data-sender.component';

describe('DataSenderComponent', () => {
  let component: DataSenderComponent;
  let fixture: ComponentFixture<DataSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
