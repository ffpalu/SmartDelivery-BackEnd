export const SOCKET_EVENTS = {
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',

	AUTHENTICATE: 'authenticate',
	AUTHENTICATION_ERROR: 'authentication_error',

	ORDER_CREATED: 'order_created',
	ORDER_UPDATED: 'order_updated',
	ORDER_STATUS_UPDATE: 'order_status_update',
	ORDER_ASSIGNED: 'order_assigned',
	ORDER_CANCELLED: 'order_cancelled',
	NEW_ORDER: 'new_order',


	TRACK_ORDER: 'track_order',
	TRACKING_STARTED: 'tracking_started',
	LOCATION_UPDATE: 'location_update',
	DELIVERY_UPDATE: 'delivery_update',


	COURIER_STATUS: 'courier_status',
	COURIER_AVAILABLE: 'courier_available',
	COURIER_BUSY: 'courier_busy',

	NOTIFICATION: 'notification',
	ERROR: 'error',

	USER_REGISTERED: 'user_registered',
	SYSTEM_UPDATE: 'system_update'
};

export const SOCKET_ROOMS = {
	USER: (userId:number) => `user_${userId}`,
	ORDER: (orderId:number) => `order_${orderId}`,
	ROLE: (role:string) => `role_${role}`,
	ADMIN: 'admin_room',
	COURIERS: 'couriers_room'
}