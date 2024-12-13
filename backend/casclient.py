# ----------------------------------------------------------------------
# CASClient.py
# Originally by
# Alex Halderman, Scott Karlin, Brian Kernighan, Bob Dondero
# with help from Joshua Lau '26
# ----------------------------------------------------------------------

import json
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
        val_url = self.cas_url + 'serviceValidate' + \
        '?service=' + quote(self.stripTicket()) + \
        '&ticket=' + quote(ticket) + \
        '&format=json'
    
        try:
            with urlopen(val_url) as response:
                res_obj = json.loads(response.read().decode('utf-8'))

                if not res_obj or 'serviceResponse' not in res_obj:
                    return None

                service_response = res_obj['serviceResponse']
                
                if 'authenticationSuccess' in service_response:
                    user_info = service_response['authenticationSuccess']
                    year = "Student"
                    
                    return {
                        'netid': user_info['user'],
                        'displayname': user_info['attributes'].get('displayname', ['Student'])[0],
                        'mail': user_info['attributes'].get('mail', [''])[0],
                        'year': year
                    }
                    
                elif 'authenticationFailure' in service_response:
                    print("CAS authentication failure:", service_response)
                    return None
                else:
                    print("Unexpected CAS response:", service_response)
                    return None
                    
        except Exception as e:
            print(f"CAS validation error: {e}")
            return None
    
    def is_logged_in(self):
        return 'netid' in session
    
    def getUserInfo(self):
        if 'netid' in session:
            return {
                    'netid': session['netid'],
                    'displayname': session['displayname'],
                    'mail': session['mail'],
                    'year': session['year']
                    }
        return None
    
    def authenticate(self):
        if self.is_logged_in():
            return self.getUserInfo()
        ticket = request.args.get('ticket')
        if ticket is not None:
            user_info = self.validate(ticket)
            if user_info is not None:
                # The user is authenticated, so store the user's
                # username in the session.
                session['netid'] = user_info['netid'].lower().strip()
                session['displayname'] = user_info['displayname'].strip()
                session['mail'] = user_info['mail'].lower().strip()
                session['year'] = user_info['year'].lower().strip()
                return user_info
        
        login_url = self.cas_url + 'login' \
            + '?service=' + quote(self.stripTicket())
        abort(redirect(login_url))
    
    def logout(self):
        if 'netid' in session:
            # Delete the user's username from the session.
            session.pop('netid')
            session.pop('displayname')
            session.pop('mail')
            session.pop('year')
        redirect("index.html")