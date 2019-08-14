import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject, of } from 'rxjs';
import { AuthService, UserinfoService, Userinfo, HalDoc, HalService, MockHalService } from 'ngx-prx-styleguide';
import { UserService } from './user.service';
import { UserServiceMock } from './user.service.mock';

describe('UserService', () => {
  let userService: UserService;
  const mockHalService = new MockHalService();
  const userServiceMock = new UserServiceMock();
  let mockUser: HalDoc;
  let mockAccounts: HalDoc[];
  let mockDefaultAccount: HalDoc;
  const authToken = new Subject<string>();

  userServiceMock.userDoc.subscribe(userDoc => {
    mockUser = userDoc;
  });
  userServiceMock.accounts.subscribe(accounts => {
    mockAccounts = accounts;
  });
  userServiceMock.defaultAccount.subscribe(defaultAccount => {
    mockDefaultAccount = defaultAccount;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: {
            token: authToken,
            parseToken: () => true
          }
        },
        {
          provide: UserinfoService,
          useValue: {
            config: () => {},
            getUserinfo: () => of(userServiceMock.userinfo),
            getUserDoc: () => userServiceMock.userDoc
          }
        },
        {
          provide: HalService,
          useValue: mockHalService
        }
      ],
      imports: [HttpClientTestingModule]
    });

    userService = TestBed.get(UserService);
    authToken.next('thetoken');
  });

  it('should load the user doc', (done) => {
    userService.userDoc.subscribe(userDoc => {
      expect(userDoc['login']).toBeDefined();
      expect(userDoc['login']).toEqual(mockUser['login']);
      done();
    });
  });

  it('should load the userinfo', () => {
    expect(userService.userinfo.preferred_username).toEqual(userServiceMock.userinfo.preferred_username);
  });

  it('should load the accounts', () => {
    userService.accounts.subscribe(accounts => {
      expect(accounts.length).toEqual(mockAccounts.length);
      expect(accounts[0]['shortName']).toBeDefined();
      expect(accounts[0]['shortName']).toEqual(mockAccounts[0]['shortName']);
    });
  });

  it('should load the default account', () => {
    userService.accounts.subscribe(defaultAccount => {
      expect(defaultAccount['shortName']).toBeDefined();
      expect(defaultAccount['shortName']).toEqual(mockDefaultAccount['shortName']);
    });
  });
});
