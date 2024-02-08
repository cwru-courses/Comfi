# Comphy
This is the repo for CWRU Computer Science Senior project, This group is aiming to make a tinder like app for chosing movies with your friends, family or significant other. The idea is that you and your group swipe left and right on various movies to find a match for you and your group to enjoy.

### To run backend server follow these steps.

It is recommended that you use pipenv or virtualenv when running Django server locally. Install pipenv using pip then run:

`pipenv shell`


To run the server, in terminal run the following command in the `core/` directory:

`python manage.py runserver 0.0.0.0:8000`

In the terminal window, an address is provided that lets you view in browser.

To view admin dashboard, first an account must be created by running the following command:

`python manage.py createsuperuser`

Follow the instructed in terminal window, then go the the address provided once server is ran with `/admin` appened after the port number.

***
It is required to be on pipenv environement for modules to import correctly. In VS Code change interpreter in command pallet to 'pipenv' interpreter
***


### To run frontend follow these steps .

in `frontend/` directory, run:

`npm install`

Before starting, the IP Address to reach the backend must be changed to the IP address of the device that it is running on. In settings you should find the IPv4 address. Change the ENDPOINT_BASE_URL in constants.js to be the address found. Then run the server:

`npx expo start`
