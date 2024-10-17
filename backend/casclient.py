from flask import session, redirect, request, abort
from re import sub
from urllib.request import urlopen
from urllib.parse import quote

class CASClient:
    def __init__(self, url="https://fed.princeton.edu/cas/"):
        self.cas_url = url

    def stripTicket(self):
        url = request.url
        if url is None:
            return 'something is badly wrong'
        url = sub(r'ticket=[^&]*&?', '', url)
        url = sub(r'\?&?$|&$', '', url)
        return url
    
    def validate(self, ticket):
        val_url = self.cas_url + 'validate' + \
            '?service=' + quote(self.stripTicket()) + \
            '&ticket=' + quote(ticket)
        print("validate")
        print(val_url)
        r = urlopen(val_url).readlines()   # returns 2 lines
        if len(r) != 2:
            return None
        firstLine = r[0].decode('utf-8')
        secondLine = r[1].decode('utf-8')
        if not firstLine.startswith('yes'):
            return None
        return secondLine
    
    def is_logged_in(self):
        return 'netid' in session
    
    def getNetID(self):
        if 'netid' in session:
            return session['netid'].lower().strip()
        return None
    
    def authenticate(self):
        if self.is_logged_in():
            return self.getNetID()
        ticket = request.args.get('ticket')
        print("ticket")
        print(ticket)
        if ticket is not None:
            netid = self.validate(ticket)
            if netid is not None:
                # The user is authenticated, so store the user's
                # username in the session.
                session['netid'] = netid
                return netid.lower().strip()
        
        login_url = self.cas_url + 'login' \
            + '?service=' + quote(self.stripTicket())
        abort(redirect(login_url))
    
    def logout(self):
        if 'netid' in session:
            # Delete the user's username from the session.
            session.pop('netid')
        redirect("index.html")