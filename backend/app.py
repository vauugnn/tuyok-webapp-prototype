from flask import Flask, request, jsonify
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

@app.route("/", methods=["GET", "POST"])
def calculate_fare():
    fare = None
    geolocator = Nominatim(user_agent="FareCalculator (vaughnrochederoda@gmail.com)")
    location = geolocator.geocode("Davao City")
    coords = [location.latitude, location.longitude]
    point_a = (51.7519, -1.2578)
    point_b = (50.8429, -0.1313)
    distance = geodesic(point_a, point_b).kilometers

    if request.method == "POST":
        apply_discount = request.json.get('discount')
        if distance and apply_discount:
            fare = calculate_fare_with_discount(distance)
        elif distance:
            fare = calculate_fare_regular(distance)

    return jsonify({'fare': fare, 'coords': coords, 'distance': distance, 'point_a': point_a, 'point_b': point_b})

@app.route('/distance', methods=['GET'])
def get_distance():
    point_a = (51.7519, -1.2578)
    point_b = (50.8429, -0.1313)
    distance = geodesic(point_a, point_b).miles
    print(distance)
    return jsonify({'distance': distance})

@app.route('/map', methods=['GET'])
def map():
    geolocator = Nominatim(user_agent="FareCalculator (vaughnrochederoda@gmail.com)")
    location = geolocator.geocode("Davao City")
    return jsonify({'coords': [location.latitude, location.longitude]})

@app.route('/calculate_fare', methods=['POST'])
def calculate_fare_post():
    data = request.get_json()
    distance = float(data['distance'])
    apply_discount = data['discount']

    if apply_discount:
        fare = calculate_fare_with_discount(distance)
    else:
        fare = calculate_fare_regular(distance)

    return jsonify({'fare': fare})

def calculate_fare_regular(distance):
    if distance <= 4:
        return 15
    else:
        return 15 + (distance - 4) * 2

def calculate_fare_with_discount(distance):
    regular_fare = calculate_fare_regular(distance)
    return int((regular_fare * 0.8))

if __name__ == "__main__":
    app.run(debug=True)