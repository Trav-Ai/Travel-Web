
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_sitemapper import Sitemapper
import bcrypt
import requests
import datetime
import bard,os
from dotenv import load_dotenv
from flask_cors import CORS
import logging
import os

logging.basicConfig(level=logging.DEBUG)

# Load the environment variables
load_dotenv()
api_key = "HYA7MBM9MQT687ZDAXUZ27G9A"
# secret_key = os.getenv("SECRET_KEY")
secret_key='21312edasASDASDASDASDASDS'

# Initialize the app
app = Flask(__name__, template_folder='templates')
CORS(app)

sitemapper = Sitemapper(app=app) # Create and initialize the sitemapper
app.secret_key = secret_key
# app.secret_key = os.urandom(24)


# Weather Data 


def get_weather_data(api_key: str, location: str, start_date: str, end_date: str) -> dict:
    """
    Retrieves weather data from Visual Crossing Weather API for a given location and date range.

    Args:
        api_key (str): API key for Visual Crossing Weather API.
        location (str): Location for which weather data is to be retrieved.
        start_date (str): Start date of the date range in "MM/DD/YYYY" format.
        end_date (str): End date of the date range in "MM/DD/YYYY" format.

    Returns:
        dict: Weather data in JSON format.

    Raises:
        requests.exceptions.RequestException: If there is an error in making the API request.
    """
    # Date Formatting as per API "YYYY-MM-DD"

    base_url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{location}/{start_date}/{end_date}?unitGroup=metric&include=days&key={api_key}&contentType=json"

    try:
        response = requests.get(base_url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print("Error:", str(e))
    raise  # Optionally raise the exception again to propagate it up the call stack

        


@sitemapper.include() # Include the route in the sitemap
@app.route('/', methods=["GET", "POST"])
def index():
    """
    Renders the index.html template.

    Returns:
        The rendered index.html template.
    """
    if request.method == "POST":
        global source, destination, start_date, end_date
        source = request.form.get("source")
        destination = request.form.get("destination")
        start_date = request.form.get("date")
        end_date = request.form.get("return")
        # Calculating the number of days
        no_of_day = (datetime.datetime.strptime(end_date, "%Y-%m-%d") - datetime.datetime.strptime(start_date, "%Y-%m-%d")).days
        # Process the route input here
        if no_of_day < 0:
            flash("Return date should be greater than the Travel date (Start date).", "danger")
            return redirect(url_for("index"))
        else:
            try:
                weather_data = get_weather_data(api_key, destination, start_date, end_date)
            except requests.exceptions.RequestException as e:
                flash("Error in retrieving weather data.{e.Error}", "danger")
                return redirect(url_for("index"))
        
        """Debugging"""
        # Json data format printing
        # print(json.dumps(weather_data, indent=4, sort_keys=True))
        try:
            plan = bard.generate_itinerary(source, destination, start_date, end_date, no_of_day)
        except Exception as e:
            flash("Error in generating the plan. Please try again later.", "danger")
            return redirect(url_for("index"))
        if weather_data:
            # Render the weather information in the template
            return render_template("dashboard.html", weather_data=weather_data, plan=plan)
    
    return render_template('index.html')


# Robots.txt
@app.route('/robots.txt')
def robots():
    return render_template('robots.txt')

# Sitemap
@app.route("/sitemap.xml")
def r_sitemap():
    return sitemapper.generate()

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """
    Renders the 404.html template.

    Returns:
        The rendered 404.html template.
    """
    return render_template('404.html'), 404

# Injecting current time into all templates for copyright year automatically updation
@app.context_processor
def inject_now():
    return {'now': datetime.datetime.now()}


