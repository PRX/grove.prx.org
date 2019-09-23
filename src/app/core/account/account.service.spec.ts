import { AccountService } from './account.service';
import { UserServiceMock } from '../user/user.service.mock';

describe('AccountService', () => {
  let user: UserServiceMock;
  let account: AccountService;

  beforeEach(() => {
    user = new UserServiceMock();
    account = new AccountService(user as any);
  });

  it('lists accounts', done => {
    account.listAccounts().subscribe(accounts => {
      expect(accounts.length).toEqual(2);
      expect(accounts[0]).toMatchObject({ id: 12 });
      expect(accounts[1]).toMatchObject({ id: 11 });
      done();
    });
  });
});
