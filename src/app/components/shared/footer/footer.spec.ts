import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Footer } from './footer';
import { By } from '@angular/platform-browser';

describe('Footer Component', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer container', () => {
    const footerElement = fixture.debugElement.query(By.css('.footer'));
    expect(footerElement).toBeTruthy();
  });

  it('should display company name in footer', () => {
    const companyName = fixture.debugElement.query(By.css('.footer-title'));
    expect(companyName).toBeTruthy();
    expect(companyName.nativeElement.textContent).toContain('Princegaming');
  });

  it('should display company description', () => {
    const description = fixture.debugElement.query(By.css('.footer-description'));
    expect(description).toBeTruthy();
    expect(description.nativeElement.textContent).toContain('tienda de confianza');
  });

  it('should have three footer sections', () => {
    const sections = fixture.debugElement.queryAll(By.css('.footer-section'));
    expect(sections.length).toBe(3);
  });

  describe('Quick Links Section', () => {
    it('should display quick links title', () => {
      const quickLinksTitle = fixture.debugElement.query(By.css('.footer-subtitle'));
      expect(quickLinksTitle).toBeTruthy();
      expect(quickLinksTitle.nativeElement.textContent).toContain('Enlaces Rápidos');
    });

    it('should have three navigation links', () => {
      const links = fixture.debugElement.queryAll(By.css('.footer-links a'));
      expect(links.length).toBe(3);
    });

    it('should have correct router links', () => {
      const links = fixture.debugElement.queryAll(By.css('.footer-links a'));
      const expectedRoutes = ['/home', '/productos', '/login'];
      
      links.forEach((link, index) => {
        expect(link.attributes['routerLink']).toBe(expectedRoutes[index]);
      });
    });

    it('should display correct link texts', () => {
      const links = fixture.debugElement.queryAll(By.css('.footer-links a'));
      const expectedTexts = ['Inicio', 'Productos', 'Empresa'];
      
      links.forEach((link, index) => {
        expect(link.nativeElement.textContent).toContain(expectedTexts[index]);
      });
    });
  });

  describe('Contact Information Section', () => {
    it('should display contact section title', () => {
      const contactTitle = fixture.debugElement.queryAll(By.css('.footer-subtitle'))[1];
      expect(contactTitle).toBeTruthy();
      expect(contactTitle.nativeElement.textContent).toContain('Información de Contacto');
    });

    it('should display email address', () => {
      const contactInfo = fixture.debugElement.query(By.css('.contact-info'));
      expect(contactInfo.nativeElement.textContent).toContain('andreypelaez9@gmail.com');
    });

    it('should display phone number', () => {
      const contactInfo = fixture.debugElement.query(By.css('.contact-info'));
      expect(contactInfo.nativeElement.textContent).toContain('+57 315 523 0570');
    });

    it('should display address', () => {
      const contactInfo = fixture.debugElement.query(By.css('.contact-info'));
      expect(contactInfo.nativeElement.textContent).toContain('Carrera 38 # 10 - 09');
    });
  });

  describe('Footer Bottom Section', () => {
    it('should display copyright notice', () => {
      const copyright = fixture.debugElement.query(By.css('.copyright'));
      expect(copyright).toBeTruthy();
      expect(copyright.nativeElement.textContent).toContain('© 2024 Princegaming');
    });

    it('should display credits', () => {
      const credits = fixture.debugElement.query(By.css('.credits'));
      expect(credits).toBeTruthy();
      expect(credits.nativeElement.textContent).toContain('Desarrollado por');
    });

    it('should have link to developer website', () => {
      const devLink = fixture.debugElement.query(By.css('.credits a'));
      expect(devLink).toBeTruthy();
      expect(devLink.attributes['href']).toBe('https://nojhze4.github.io/bit-website/');
      expect(devLink.attributes['target']).toBe('_blank');
    });
  });

  describe('Responsive Design', () => {
    it('should have footer-container class', () => {
      const container = fixture.debugElement.query(By.css('.footer-container'));
      expect(container).toBeTruthy();
    });

    it('should have footer-content class', () => {
      const content = fixture.debugElement.query(By.css('.footer-content'));
      expect(content).toBeTruthy();
    });

    it('should have footer-bottom section', () => {
      const bottom = fixture.debugElement.query(By.css('.footer-bottom'));
      expect(bottom).toBeTruthy();
    });

    it('should have footer divider', () => {
      const divider = fixture.debugElement.query(By.css('.footer-divider'));
      expect(divider).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic footer element', () => {
      const footer = fixture.debugElement.query(By.css('footer'));
      expect(footer).toBeTruthy();
    });

    it('should have proper heading hierarchy', () => {
      const h3 = fixture.debugElement.query(By.css('h3'));
      const h4 = fixture.debugElement.query(By.css('h4'));
      expect(h3).toBeTruthy();
      expect(h4).toBeTruthy();
    });
  });
});
