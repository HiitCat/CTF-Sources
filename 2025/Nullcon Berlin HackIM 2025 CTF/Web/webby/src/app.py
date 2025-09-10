import web
import secrets
import random
import tempfile
import hashlib
import time
import shelve
import bcrypt
from web import form
web.config.debug = False
urls = (
  '/', 'index',
  '/mfa', 'mfa',
  '/flag', 'flag',
  '/logout', 'logout',
)
app = web.application(urls, locals())
render = web.template.render('templates/')
session = web.session.Session(app, web.session.ShelfStore(shelve.open("/tmp/session.shelf")))
FLAG = open("/tmp/flag.txt").read()

def check_user_creds(user,pw):
    users = {
        # Add more users if needed
        'user1': 'user1',
        'user2': 'user2',
        'user3': 'user3',
        'user4': 'user4',
        'admin': 'admin',

    }
    try:
        return users[user] == pw
    except:
        return False

def check_mfa(user):
    users = {
        'user1': False,
        'user2': False,
        'user3': False,
        'user4': False,
        'admin': True,
    }
    try:
        return users[user]
    except:
        return False


login_Form = form.Form(
    form.Textbox("username", description="Username"),
    form.Password("password", description="Password"),
    form.Button("submit", type="submit", description="Login")
)
mfatoken = form.regexp(r"^[a-f0-9]{32}$", 'must match ^[a-f0-9]{32}$')
mfa_Form = form.Form(
    form.Password("token", mfatoken, description="MFA Token"),
    form.Button("submit", type="submit", description="Submit")
)

class index:
    def GET(self):
        try:
            i = web.input()
            if i.source:
                return open(__file__).read()
        except Exception as e:
            pass
        f = login_Form()
        return render.index(f)

    def POST(self):
        f = login_Form()
        if not f.validates():
            session.kill()
            return render.index(f)
        i = web.input()
        if not check_user_creds(i.username, i.password):
            session.kill()
            raise web.seeother('/')
        else:
            session.loggedIn = True
            session.username = i.username
            session._save()

        if check_mfa(session.get("username", None)):
            session.doMFA = True
            session.tokenMFA = hashlib.md5(bcrypt.hashpw(str(secrets.randbits(random.randint(40,65))).encode(),bcrypt.gensalt(14))).hexdigest()
            #session.tokenMFA = "acbd18db4cc2f85cedef654fccc4a4d8"
            session.loggedIn = False
            session._save()
            raise web.seeother("/mfa")
        return render.login(session.get("username",None))

class mfa:
    def GET(self):
        if not session.get("doMFA",False):
            raise web.seeother('/login')
        f = mfa_Form()
        return render.mfa(f)

    def POST(self):
        if not session.get("doMFA", False):
            raise web.seeother('/login')
        f = mfa_Form()
        if not f.validates():
            return render.mfa(f)
        i = web.input()
        if i.token != session.get("tokenMFA",None):
            raise web.seeother("/logout")
        session.loggedIn = True
        session._save()
        raise web.seeother('/flag')


class flag:
    def GET(self):
        if not session.get("loggedIn",False) or not session.get("username",None) == "admin":
            raise web.seeother('/')
        else:
            session.kill()
            return render.flag(FLAG)


class logout:
    def GET(self):
        session.kill()
        raise web.seeother('/')

application = app.wsgifunc()
if __name__ == "__main__":
    app.run()