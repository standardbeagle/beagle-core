import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import {
  Routes,
  Route,
  Link,
  usePath,
  useNavigate,
  useNavigation,
} from '@standardbeagle/virtual-router';
import {
  useXPath,
  useNavigate as useDataNavigate,
  useTargetData,
  useDataAtXPath,
  useDataManipulation,
} from '@standardbeagle/data-router';
import { renderWithBothRouters } from '../test-utils';

const appData = {
  contacts: [
    { id: 1, name: 'Alice', email: 'alice@example.com', phone: '555-0001' },
    { id: 2, name: 'Bob', email: 'bob@example.com', phone: '555-0002' },
    { id: 3, name: 'Carol', email: 'carol@example.com', phone: '555-0003' },
  ],
  drafts: {} as Record<string, unknown>,
  settings: {
    pageSize: 10,
    theme: 'light',
  },
};

function ContactList() {
  const contacts = useDataAtXPath('/contacts') as typeof appData.contacts | undefined;
  const dataNavigate = useDataNavigate();

  if (!contacts) return <span data-testid="no-contacts">No contacts</span>;

  return (
    <ul data-testid="contact-list">
      {contacts.map((contact, index) => (
        <li key={contact.id}>
          <button
            data-testid={`select-contact-${index}`}
            onClick={() => dataNavigate(`/contacts[${index}]`)}
          >
            {contact.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ContactDetail() {
  const contact = useTargetData() as { id: number; name: string; email: string; phone: string } | undefined;

  if (!contact) return <span data-testid="no-detail">Select a contact</span>;

  return (
    <div data-testid="contact-detail">
      <span data-testid="detail-name">{contact.name}</span>
      <span data-testid="detail-email">{contact.email}</span>
      <span data-testid="detail-phone">{contact.phone}</span>
    </div>
  );
}

function ContactsPage() {
  return (
    <div data-testid="contacts-page">
      <h1>Contacts</h1>
      <ContactList />
      <ContactDetail />
    </div>
  );
}

function SettingsPage() {
  const settings = useDataAtXPath('/settings') as typeof appData.settings | undefined;
  const { mergeData } = useDataManipulation();

  return (
    <div data-testid="settings-page">
      <h1>Settings</h1>
      <span data-testid="current-theme">{settings?.theme}</span>
      <button
        data-testid="toggle-theme"
        onClick={() =>
          mergeData('/settings', {
            theme: settings?.theme === 'light' ? 'dark' : 'light',
          })
        }
      >
        Toggle Theme
      </button>
    </div>
  );
}

function PageNav() {
  return (
    <nav data-testid="page-nav">
      <Link to="/contacts" data-testid="nav-contacts">Contacts</Link>
      <Link to="/settings" data-testid="nav-settings">Settings</Link>
      <Link to="/" data-testid="nav-home">Home</Link>
    </nav>
  );
}

function StatusBar() {
  const path = usePath();
  const xpath = useXPath();
  return (
    <div data-testid="status-bar">
      <span data-testid="status-page">{path}</span>
      <span data-testid="status-data">{xpath}</span>
    </div>
  );
}

function MiniApp() {
  return (
    <div>
      <PageNav />
      <StatusBar />
      <Routes>
        <Route path="/">
          <div data-testid="home-page">Welcome</div>
        </Route>
        <Route path="contacts">
          <ContactsPage />
        </Route>
        <Route path="settings">
          <SettingsPage />
        </Route>
      </Routes>
    </div>
  );
}

describe('Cross-Router: Combined Workflows', () => {
  describe('Page navigation with data state', () => {
    it('navigates to contacts page and selects a contact using data-router', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(<MiniApp />, { initialData: appData });

      expect(screen.getByTestId('home-page')).toHaveTextContent('Welcome');

      await user.click(screen.getByTestId('nav-contacts'));
      expect(screen.getByTestId('contacts-page')).toBeInTheDocument();
      expect(screen.getByTestId('status-page')).toHaveTextContent('/contacts');

      await user.click(screen.getByTestId('select-contact-0'));
      expect(screen.getByTestId('detail-name')).toHaveTextContent('Alice');
      expect(screen.getByTestId('detail-email')).toHaveTextContent('alice@example.com');
      expect(screen.getByTestId('status-data')).toHaveTextContent('/contacts[0]');
    });

    it('data-router state persists when navigating virtual-router pages', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(<MiniApp />, { initialData: appData });

      await user.click(screen.getByTestId('nav-contacts'));
      await user.click(screen.getByTestId('select-contact-1'));
      expect(screen.getByTestId('detail-name')).toHaveTextContent('Bob');

      await user.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      expect(screen.getByTestId('status-data')).toHaveTextContent('/contacts[1]');

      await user.click(screen.getByTestId('nav-contacts'));
      expect(screen.getByTestId('detail-name')).toHaveTextContent('Bob');
      expect(screen.getByTestId('status-data')).toHaveTextContent('/contacts[1]');
    });

    it('switches between contacts using data-router while staying on the same page', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(<MiniApp />, { initialData: appData });

      await user.click(screen.getByTestId('nav-contacts'));

      await user.click(screen.getByTestId('select-contact-0'));
      expect(screen.getByTestId('detail-name')).toHaveTextContent('Alice');

      await user.click(screen.getByTestId('select-contact-2'));
      expect(screen.getByTestId('detail-name')).toHaveTextContent('Carol');
      expect(screen.getByTestId('status-page')).toHaveTextContent('/contacts');
    });
  });

  describe('Settings modification with page navigation', () => {
    it('modifies data-router state (theme) and returns to contacts page', async () => {
      const user = userEvent.setup();
      renderWithBothRouters(<MiniApp />, { initialData: appData });

      await user.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await user.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await user.click(screen.getByTestId('nav-contacts'));
      expect(screen.getByTestId('contacts-page')).toBeInTheDocument();

      await user.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  describe('Form-like workflow: navigation + data storage', () => {
    it('creates data in data-router and navigates pages with virtual-router', async () => {
      const user = userEvent.setup();

      function DraftPage() {
        const { replaceData } = useDataManipulation();
        const drafts = useDataAtXPath('/drafts') as Record<string, unknown> | undefined;

        return (
          <div data-testid="draft-page">
            <button
              data-testid="save-draft"
              onClick={() =>
                replaceData('/drafts', {
                  ...(drafts || {}),
                  newContact: { name: 'Dave', email: 'dave@example.com' },
                })
              }
            >
              Save Draft
            </button>
            <span data-testid="draft-data">{JSON.stringify(drafts)}</span>
          </div>
        );
      }

      function AppWithDrafts() {
        return (
          <div>
            <PageNav />
            <Link to="/drafts" data-testid="nav-drafts">Drafts</Link>
            <StatusBar />
            <Routes>
              <Route path="/">
                <div data-testid="home-page">Welcome</div>
              </Route>
              <Route path="contacts">
                <ContactsPage />
              </Route>
              <Route path="drafts">
                <DraftPage />
              </Route>
            </Routes>
          </div>
        );
      }

      renderWithBothRouters(<AppWithDrafts />, { initialData: appData });

      await user.click(screen.getByTestId('nav-drafts'));
      expect(screen.getByTestId('draft-page')).toBeInTheDocument();

      await user.click(screen.getByTestId('save-draft'));
      const draftData = JSON.parse(screen.getByTestId('draft-data').textContent!);
      expect(draftData.newContact).toEqual({ name: 'Dave', email: 'dave@example.com' });

      await user.click(screen.getByTestId('nav-contacts'));
      expect(screen.getByTestId('contacts-page')).toBeInTheDocument();

      await user.click(screen.getByTestId('nav-drafts'));
      const draftDataAfter = JSON.parse(screen.getByTestId('draft-data').textContent!);
      expect(draftDataAfter.newContact).toEqual({ name: 'Dave', email: 'dave@example.com' });
    });
  });

  describe('Interleaved navigation sequences', () => {
    it('handles rapid alternating navigation in both routers', async () => {
      const user = userEvent.setup();

      function DualStatus() {
        const path = usePath();
        const xpath = useXPath();
        return (
          <div>
            <span data-testid="vr-current">{path}</span>
            <span data-testid="dr-current">{xpath}</span>
          </div>
        );
      }

      function DualNav() {
        const vrNavigate = useNavigate();
        const drNavigate = useDataNavigate();
        return (
          <div>
            <button data-testid="vr-go-a" onClick={() => vrNavigate('/a')}>VR A</button>
            <button data-testid="vr-go-b" onClick={() => vrNavigate('/b')}>VR B</button>
            <button data-testid="dr-go-x" onClick={() => drNavigate('/contacts[0]')}>DR X</button>
            <button data-testid="dr-go-y" onClick={() => drNavigate('/contacts[1]')}>DR Y</button>
          </div>
        );
      }

      renderWithBothRouters(
        <div>
          <DualNav />
          <DualStatus />
        </div>,
        { initialData: appData },
      );

      await user.click(screen.getByTestId('vr-go-a'));
      expect(screen.getByTestId('vr-current')).toHaveTextContent('/a');
      expect(screen.getByTestId('dr-current')).toHaveTextContent('/');

      await user.click(screen.getByTestId('dr-go-x'));
      expect(screen.getByTestId('vr-current')).toHaveTextContent('/a');
      expect(screen.getByTestId('dr-current')).toHaveTextContent('/contacts[0]');

      await user.click(screen.getByTestId('vr-go-b'));
      expect(screen.getByTestId('vr-current')).toHaveTextContent('/b');
      expect(screen.getByTestId('dr-current')).toHaveTextContent('/contacts[0]');

      await user.click(screen.getByTestId('dr-go-y'));
      expect(screen.getByTestId('vr-current')).toHaveTextContent('/b');
      expect(screen.getByTestId('dr-current')).toHaveTextContent('/contacts[1]');
    });

    it('back navigation in one router while other is at different position', async () => {
      const user = userEvent.setup();
      const vrNav = useNavigation;

      function BackControls() {
        const vrNavObj = vrNav();
        return (
          <div>
            <button data-testid="vr-back" onClick={() => vrNavObj.back()}>VR Back</button>
            <span data-testid="vr-pos">{vrNavObj.path}</span>
          </div>
        );
      }

      function DrNav() {
        const navigate = useDataNavigate();
        const xpath = useXPath();
        return (
          <div>
            <button data-testid="dr-go-1" onClick={() => navigate('/contacts[0]')}>DR 1</button>
            <button data-testid="dr-go-2" onClick={() => navigate('/contacts[1]')}>DR 2</button>
            <span data-testid="dr-pos">{xpath}</span>
          </div>
        );
      }

      function VrNav() {
        const navigate = useNavigate();
        return (
          <div>
            <button data-testid="vr-go-1" onClick={() => navigate('/page1')}>VR 1</button>
            <button data-testid="vr-go-2" onClick={() => navigate('/page2')}>VR 2</button>
          </div>
        );
      }

      renderWithBothRouters(
        <div>
          <VrNav />
          <DrNav />
          <BackControls />
        </div>,
        { initialData: appData },
      );

      await user.click(screen.getByTestId('vr-go-1'));
      await user.click(screen.getByTestId('vr-go-2'));
      await user.click(screen.getByTestId('dr-go-1'));
      await user.click(screen.getByTestId('dr-go-2'));

      expect(screen.getByTestId('vr-pos')).toHaveTextContent('/page2');
      expect(screen.getByTestId('dr-pos')).toHaveTextContent('/contacts[1]');

      await user.click(screen.getByTestId('vr-back'));
      expect(screen.getByTestId('vr-pos')).toHaveTextContent('/page1');
      expect(screen.getByTestId('dr-pos')).toHaveTextContent('/contacts[1]');
    });
  });

  describe('Performance: render isolation in combined app', () => {
    it('selecting a contact does not re-render page navigation', async () => {
      const user = userEvent.setup();

      function PageRenderCounter() {
        const renderCount = useRef(0);
        renderCount.current += 1;
        const path = usePath();
        return (
          <div>
            <span data-testid="page-renders">{renderCount.current}</span>
            <span data-testid="page-path">{path}</span>
          </div>
        );
      }

      function DataRenderCounter() {
        const renderCount = useRef(0);
        renderCount.current += 1;
        const xpath = useXPath();
        return (
          <div>
            <span data-testid="data-renders">{renderCount.current}</span>
            <span data-testid="data-xpath">{xpath}</span>
          </div>
        );
      }

      function ContactSelector() {
        const navigate = useDataNavigate();
        return (
          <div>
            <button data-testid="pick-0" onClick={() => navigate('/contacts[0]')}>Alice</button>
            <button data-testid="pick-1" onClick={() => navigate('/contacts[1]')}>Bob</button>
          </div>
        );
      }

      renderWithBothRouters(
        <div>
          <PageRenderCounter />
          <DataRenderCounter />
          <ContactSelector />
        </div>,
        { initialPath: '/contacts', initialData: appData },
      );

      const pageRendersBefore = Number(screen.getByTestId('page-renders').textContent);

      await user.click(screen.getByTestId('pick-0'));
      await user.click(screen.getByTestId('pick-1'));

      const pageRendersAfter = Number(screen.getByTestId('page-renders').textContent);
      expect(pageRendersAfter).toBe(pageRendersBefore);
    });

    it('page navigation does not re-render data-router consumers', async () => {
      const user = userEvent.setup();

      function DataConsumer() {
        const renderCount = useRef(0);
        renderCount.current += 1;
        const data = useTargetData();
        return (
          <div>
            <span data-testid="data-consumer-renders">{renderCount.current}</span>
            <span data-testid="data-consumer-value">{JSON.stringify(data)}</span>
          </div>
        );
      }

      function PageSwitch() {
        const navigate = useNavigate();
        return (
          <div>
            <button data-testid="go-about" onClick={() => navigate('/about')}>About</button>
            <button data-testid="go-home" onClick={() => navigate('/')}>Home</button>
          </div>
        );
      }

      renderWithBothRouters(
        <div>
          <PageSwitch />
          <DataConsumer />
        </div>,
        { initialData: appData },
      );

      const rendersBefore = Number(screen.getByTestId('data-consumer-renders').textContent);

      await user.click(screen.getByTestId('go-about'));
      await user.click(screen.getByTestId('go-home'));

      const rendersAfter = Number(screen.getByTestId('data-consumer-renders').textContent);
      expect(rendersAfter).toBe(rendersBefore);
    });
  });
});
