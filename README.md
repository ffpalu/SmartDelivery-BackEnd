# SmartDelivery - Sistema di Gestione Consegne

## 📦 Panoramica
Sistema backend REST + WebSocket per gestione consegne in tempo reale. Supporta autenticazione JWT, tracking GPS, notifiche real-time e upload file.

**Tech Stack**: Node.js, TypeScript, Express, MySQL, TypeORM, Socket.IO, Winston

## 🚀 Setup Rapido

```bash
git clone <repository>
cd smartdelivery-backend
npm install
cp .env.example .env
# Configura database in .env
npm run dev
```

## ⚙️ Configurazione Database

```sql
CREATE DATABASE smartdelivery;
CREATE USER 'smartdelivery_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON smartdelivery.* TO 'smartdelivery_user'@'localhost';
```

**.env:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=smartdelivery_user
DB_PASSWORD=your_password
DB_NAME=smartdelivery
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3000
```

## 👥 Ruoli
- **Customer**: Crea e monitora ordini
- **Courier**: Gestisce consegne, aggiorna posizione
- **Admin**: Gestione completa sistema

## 📡 API Endpoints

### Autenticazione

**POST /api/v1/auth/register**
```json
{
  "email": "user@email.com",
  "password": "Password123",
  "firstName": "Nome",
  "lastName": "Cognome",
  "role": "customer|courier|admin"
}
```

**POST /api/v1/auth/login**
```json
{
  "email": "user@email.com",
  "password": "Password123"
}
```

### Ordini

**POST /api/v1/orders** (Customer)
```json
{
  "pickupAddress": "Via Milano 10",
  "deliveryAddress": "Via Roma 20",
  "description": "Documenti urgenti",
  "estimatedPrice": 15.50
}
```

**GET /api/v1/orders**
Query params: `page`, `limit`, `status`, `dateFrom`, `dateTo`

**PUT /api/v1/orders/:id**
```json
{
  "status": "in_transit",
  "notes": "In viaggio"
}
```

**PUT /api/v1/orders/:id/assign** (Admin)
```json
{
  "courierId": 2
}
```

### Utenti

**GET /api/v1/users/profile**

**PUT /api/v1/users/profile**
```json
{
  "firstName": "Nuovo Nome",
  "latitude": 45.4642,
  "longitude": 9.1900
}
```

**GET /api/v1/users** (Admin)
**GET /api/v1/users/couriers**

### Consegne

**PUT /api/v1/deliveries/:id/location** (Courier)
```json
{
  "latitude": 45.4642,
  "longitude": 9.1900,
  "status": "in_transit"
}
```

**POST /api/v1/deliveries/:id/proof** (Courier)
Form data: `proof` (immagine)

## ⚡ WebSocket Events

**Connessione:**
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt_token' }
});
```

**Eventi ricevuti:**
- `order_status_update` - Cambio stato ordine
- `order_assigned` - Ordine assegnato
- `location_update` - Posizione corriere
- `new_order` - Nuovo ordine (corrieri)

**Eventi inviati:**
- `track_order` - Inizia tracking
- `location_update` - Aggiorna posizione

## 🔒 Sicurezza

- **Rate Limiting**: 100 req/15min (generale), 5 req/15min (auth)
- **JWT**: Token authentication
- **Bcrypt**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin protection
- **Input Validation**: express-validator

## 📊 Stati Ordine
`pending` → `accepted` → `in_transit` → `delivered` / `cancelled`

## 🧪 Testing

```bash
npm test
```

Test su database remoto configurato automaticamente.

## 📋 Scripts

```bash
npm run dev      # Development server
npm run build    # Build production
npm run start    # Production server  
npm test         # Run tests
```

## 🗃️ Database Schema

**Users**: id, email, password, firstName, lastName, role, address, coordinates
**Orders**: id, customerId, courierId, addresses, status, prices, timestamps
**Deliveries**: id, orderId, location, proofImages, notes
**Logs**: id, userId, action, details, ipAddress

## 🌐 Servizi Esterni
- **OpenStreetMap**: Geocoding gratuito
- **OSRM**: Calcolo distanze
- **Multer**: Upload file (5MB max, JPEG/PNG)

## 📈 Monitoring
- **Winston**: Logs strutturati con rotazione
- **Request Logging**: IP, UserAgent, timestamp
- **Error Tracking**: Stack traces in development

## 🚀 Deploy Production

```bash
npm run build
export NODE_ENV=production
export DB_HOST=production_host
npm start
```

**Raccomandazioni**:
- PM2 per process management
- Nginx per reverse proxy
- SSL/HTTPS certificati
- Database backup automatici