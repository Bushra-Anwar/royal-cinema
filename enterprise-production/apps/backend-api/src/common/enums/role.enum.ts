export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',   // Master Platform Owner (can onboard clients & manage global billing)
  CINEMA_ADMIN = 'CINEMA_ADMIN', // Cinema / Shop Owner (manages own screens, movies, staff & ledger)
  TICKET_STAFF = 'TICKET_STAFF', // Box Office Counter Station (issues tickets & seating)
  FOOD_STAFF = 'FOOD_STAFF',     // Food Counter Station (POS F&B, KDS, inventory deduction)
  CUSTOMER = 'CUSTOMER',         // Mobile App / Web online ticket buyer
}
