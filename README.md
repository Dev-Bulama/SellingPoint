# Sellingpoint — International E-Commerce Platform

A production-ready mobile commerce suite built with Laravel, Filament, and React Native.

## Structure

```
sellingpoint/
  backend/      → Laravel API + Filament Admin Panel
  mobile/       → React Native App (Android + iOS)
  docs/         → Full documentation
```

## Quick Start

See [docs/README.md](docs/README.md) for complete setup guides.

## Demo Credentials

**Admin Panel** (`/admin`)
- Email: `admin@sellingpoint.com`
- Password: `password`

**Customer App**
- Email: `customer@sellingpoint.com`
- Password: `password`

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Mobile     | React Native + TypeScript               |
| Backend    | Laravel 11 + PHP 8.2                    |
| Admin      | Filament v3                             |
| Database   | MySQL 8                                 |
| Auth       | Laravel Sanctum                         |
| Payments   | Paystack                                |
| Push       | OneSignal                               |
| Storage    | Laravel Storage (S3-compatible)         |
| Queue      | Laravel Queues (Redis/database)         |

## License

MIT
