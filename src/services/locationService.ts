import axios from "axios";

interface Coordinates {
	latitude: number,
	longitude: number;
}

interface DistanceResult {
	distance: number;
	duration: number;
	route?: any;
}

interface GeocodeResult {
	address: string;
	latitude: number;
	longitude: number;
}

export class LocationService {
	private static readonly OPENSTREETMAP_BASE_URL = 'https://nominatim.openstreetmap.org';
	private static readonly OSRM_BASE_URL = 'https://router.project-osrm.org';

	static async calculateDistance(origin: Coordinates, destination:Coordinates): Promise<DistanceResult>{
		try{
			return await this.calculateDistanceOSRM(origin,destination);
		}
		catch(error){
			console.error('Error calculating distance:', error);
			return this.calculateHaversineDistance(origin, destination); 
		}
	}

	private static async calculateDistanceOSRM(origin:Coordinates, destination: Coordinates ): Promise<DistanceResult> {
    const url = `${this.OSRM_BASE_URL}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

		const params = {
			overview: 'false',
			geometries: 'geojson'
		};

		const response = await axios.get(url, {params});

		if(response.data.code !== 'Ok') {
			throw new Error('OSRM API error');
		}
		const route = response.data.routes[0];
		return{
			distance: route.distance,
			duration: route.duration,
			route: route.geometry
		};
	}


	private static calculateHaversineDistance(origin:Coordinates, destination: Coordinates): DistanceResult {
		const R = 6371e3;
		const phi1 = origin.latitude * Math.PI/180;
		const phi2 = destination.latitude * Math.PI/180;
		const deltaphy = (destination.latitude - origin.latitude) * Math.PI/180
		const deltalambda = (destination.longitude - origin.longitude) * Math.PI/180

		 const a = Math.sin(deltaphy/2) * Math.sin(deltaphy/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c;
    const duration = (distance / 1000) * 72; // 72 seconds per km at 50 km/h

    return { distance, duration };

	}

	static async geocodeAddress(address: string): Promise<GeocodeResult> {
		const url = `${this.OPENSTREETMAP_BASE_URL}/search`;
		const params = {
			q: address,
			format: 'json',
			limit: 1,
			addressdetails: 1
		}
		
		const response = await axios.get(url, {
			params,
			headers: {
				'User-Agent': 'SmartDelivery/1.0.0'
			}
		});

		if(response.data.length === 0)
			throw new Error('Address not found')

		const result = response.data[0];
		return {
			address: result.display_name,
			latitude: parseFloat(result.lat),
			longitude: parseFloat(result.lon)
		}

	}

	private static async reverseGeocode(latitude: number, longitude:number):Promise<string>{
		 try {
      const url = `${this.OPENSTREETMAP_BASE_URL}/reverse`;
      const params = {
        lat: latitude,
        lon: longitude,
        format: 'json'
      };

      const response = await axios.get(url, { 
        params,
        headers: {
          'User-Agent': 'SmartDelivery/1.0.0'
        }
      });

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      
      throw new Error('Reverse geocoding failed');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude}, ${longitude}`;
    }

	}

	static calculateEstimatedDelivery(distance: number, duration: number): Date {
		const now = new Date()
		const deliveryTime = new Date(now.getTime() + (duration * 1000) + (5*60 *1000))
		return deliveryTime;
	}

	static isValidCoordinate(latitude: number, longitude: number): boolean {
		return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 
	}
}