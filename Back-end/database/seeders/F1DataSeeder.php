<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\Driver;
use App\Models\Cars;
use App\Models\Race;
use App\Models\Standing;
use App\Models\User;
use Illuminate\Database\Seeder;

class F1DataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create admin user for teams
        $adminUser = User::first() ?? User::create([
            'name' => 'Admin',
            'email' => 'admin@f1.com',
            'password' => bcrypt('password123'),
        ]);

        // ===== CREATE 10 F1 TEAMS =====
        $redbull = Team::create([
            'name' => 'Oracle Red Bull Racing',
            'country' => 'England',
            'base_location' => 'Milton Keynes, England',
            'team_principal' => 'Christian Horner',
            'chassis' => 'RB20',
            'engine_supplier' => 'Honda RBPT',
            'founded_date' => '2005-01-01',
            'logo' => 'store/teams/redbull_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $mercedes = Team::create([
            'name' => 'Mercedes-AMG Petronas',
            'country' => 'England',
            'base_location' => 'Brackley, England',
            'team_principal' => 'Toto Wolff',
            'chassis' => 'W15',
            'engine_supplier' => 'Mercedes',
            'founded_date' => '1954-01-01',
            'logo' => 'store/teams/mercedes_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $ferrari = Team::create([
            'name' => 'Scuderia Ferrari',
            'country' => 'Italy',
            'base_location' => 'Maranello, Italy',
            'team_principal' => 'Frédéric Vasseur',
            'chassis' => 'SF-24',
            'engine_supplier' => 'Ferrari',
            'founded_date' => '1947-01-01',
            'logo' => 'store/teams/ferrari_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $mclaren = Team::create([
            'name' => 'McLaren F1 Team',
            'country' => 'England',
            'base_location' => 'Woking, England',
            'team_principal' => 'Andrea Stella',
            'chassis' => 'MCL38',
            'engine_supplier' => 'Mercedes',
            'founded_date' => '1963-01-01',
            'logo' => 'store/teams/mclaren_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $astonmartin = Team::create([
            'name' => 'Aston Martin F1 Team',
            'country' => 'England',
            'base_location' => 'Silverstone, England',
            'team_principal' => 'Mike Krack',
            'chassis' => 'AMR24',
            'engine_supplier' => 'Mercedes',
            'founded_date' => '2018-01-01',
            'logo' => 'store/teams/aston_martin_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $alpine = Team::create([
            'name' => 'Alpine F1 Team',
            'country' => 'France',
            'base_location' => 'Enstone, England',
            'team_principal' => 'Bruno Famin',
            'chassis' => 'A524',
            'engine_supplier' => 'Renault',
            'founded_date' => '2021-01-01',
            'logo' => 'store/teams/alpine_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $haas = Team::create([
            'name' => 'Haas F1 Team',
            'country' => 'USA',
            'base_location' => 'Kannapolis, USA',
            'team_principal' => 'Ayao Komatsu',
            'chassis' => 'VF-24',
            'engine_supplier' => 'Ferrari',
            'founded_date' => '2016-01-01',
            'logo' => 'store/teams/haas_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $kicksauber = Team::create([
            'name' => 'Kick Sauber',
            'country' => 'Switzerland',
            'base_location' => 'Hinwil, Switzerland',
            'team_principal' => 'Alessandro Alunni Testoni',
            'chassis' => 'C44',
            'engine_supplier' => 'Ferrari',
            'founded_date' => '1993-01-01',
            'logo' => 'store/teams/sauber_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $williams = Team::create([
            'name' => 'Williams Racing',
            'country' => 'England',
            'base_location' => 'Grove, England',
            'team_principal' => 'James Vowles',
            'chassis' => 'FW46',
            'engine_supplier' => 'Mercedes',
            'founded_date' => '1977-01-01',
            'logo' => 'store/teams/williams_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        $racingbulls = Team::create([
            'name' => 'Racing Bulls',
            'country' => 'Italy',
            'base_location' => 'Faenza, Italy',
            'team_principal' => 'Gianpiero Lambiase',
            'chassis' => 'VCARB01',
            'engine_supplier' => 'Ferrari',
            'founded_date' => '2020-01-01',
            'logo' => 'store/teams/racing_bulls_logo.png',
            'total_points' => 0,
            'user_id' => $adminUser->id,
        ]);

        // ===== CREATE 20 F1 DRIVERS =====
        // Red Bull Racing
        $verstappen = Driver::create([
            'first_name' => 'Max',
            'last_name' => 'Verstappen',
            'team_id' => $redbull->id,
            'nationality' => 'Dutch',
            'date_of_birth' => '1997-12-30',
            'total_points' => 412,
            'driver_img' => 'store/drivers/verstappen.jpg',
        ]);

        $perez = Driver::create([
            'first_name' => 'Sergio',
            'last_name' => 'Pérez',
            'team_id' => $redbull->id,
            'nationality' => 'Mexican',
            'date_of_birth' => '1990-01-26',
            'total_points' => 285,
            'driver_img' => 'store/drivers/perez.jpg',
        ]);

        // Mercedes
        $hamilton = Driver::create([
            'first_name' => 'Lewis',
            'last_name' => 'Hamilton',
            'team_id' => $mercedes->id,
            'nationality' => 'British',
            'date_of_birth' => '1985-01-07',
            'total_points' => 356,
            'driver_img' => 'store/drivers/hamilton.jpg',
        ]);

        $russell = Driver::create([
            'first_name' => 'George',
            'last_name' => 'Russell',
            'team_id' => $mercedes->id,
            'nationality' => 'British',
            'date_of_birth' => '1998-02-15',
            'total_points' => 341,
            'driver_img' => 'store/drivers/russell.jpg',
        ]);

        // Ferrari
        $leclerc = Driver::create([
            'first_name' => 'Charles',
            'last_name' => 'Leclerc',
            'team_id' => $ferrari->id,
            'nationality' => 'Monegasque',
            'date_of_birth' => '1997-10-16',
            'total_points' => 380,
            'driver_img' => 'store/drivers/leclerc.jpg',
        ]);

        $sainz = Driver::create([
            'first_name' => 'Carlos',
            'last_name' => 'Sainz',
            'team_id' => $ferrari->id,
            'nationality' => 'Spanish',
            'date_of_birth' => '1994-09-01',
            'total_points' => 328,
            'driver_img' => 'store/drivers/sainz.jpg',
        ]);

        // McLaren
        $norris = Driver::create([
            'first_name' => 'Lando',
            'last_name' => 'Norris',
            'team_id' => $mclaren->id,
            'nationality' => 'British',
            'date_of_birth' => '1999-11-13',
            'total_points' => 310,
            'driver_img' => 'store/drivers/norris.jpg',
        ]);

        $piastri = Driver::create([
            'first_name' => 'Oscar',
            'last_name' => 'Piastri',
            'team_id' => $mclaren->id,
            'nationality' => 'Australian',
            'date_of_birth' => '2001-04-06',
            'total_points' => 298,
            'driver_img' => 'store/drivers/piastri.jpg',
        ]);

        // Aston Martin
        $alonso = Driver::create([
            'first_name' => 'Fernando',
            'last_name' => 'Alonso',
            'team_id' => $astonmartin->id,
            'nationality' => 'Spanish',
            'date_of_birth' => '1981-07-29',
            'total_points' => 223,
            'driver_img' => 'store/drivers/alonso.jpg',
        ]);

        $stroll = Driver::create([
            'first_name' => 'Lance',
            'last_name' => 'Stroll',
            'team_id' => $astonmartin->id,
            'nationality' => 'Canadian',
            'date_of_birth' => '1998-10-29',
            'total_points' => 74,
            'driver_img' => 'store/drivers/stroll.jpg',
        ]);

        // Alpine
        $gasly = Driver::create([
            'first_name' => 'Pierre',
            'last_name' => 'Gasly',
            'team_id' => $alpine->id,
            'nationality' => 'French',
            'date_of_birth' => '1996-08-07',
            'total_points' => 155,
            'driver_img' => 'store/drivers/gasly.jpg',
        ]);

        $ocon = Driver::create([
            'first_name' => 'Esteban',
            'last_name' => 'Ocon',
            'team_id' => $alpine->id,
            'nationality' => 'French',
            'date_of_birth' => '1996-09-17',
            'total_points' => 142,
            'driver_img' => 'store/drivers/ocon.jpg',
        ]);

        // Haas
        $magnussen = Driver::create([
            'first_name' => 'Kevin',
            'last_name' => 'Magnussen',
            'team_id' => $haas->id,
            'nationality' => 'Danish',
            'date_of_birth' => '1992-05-05',
            'total_points' => 26,
            'driver_img' => 'store/drivers/magnussen.jpg',
        ]);

        $hulkenberg = Driver::create([
            'first_name' => 'Nico',
            'last_name' => 'Hülkenberg',
            'team_id' => $haas->id,
            'nationality' => 'German',
            'date_of_birth' => '1987-08-19',
            'total_points' => 61,
            'driver_img' => 'store/drivers/hulkenberg.jpg',
        ]);

        // Kick Sauber
        $zhou = Driver::create([
            'first_name' => 'Zhou',
            'last_name' => 'Guanyu',
            'team_id' => $kicksauber->id,
            'nationality' => 'Chinese',
            'date_of_birth' => '1999-05-30',
            'total_points' => 6,
            'driver_img' => 'store/drivers/zhou.jpg',
        ]);

        $bottas = Driver::create([
            'first_name' => 'Valtteri',
            'last_name' => 'Bottas',
            'team_id' => $kicksauber->id,
            'nationality' => 'Finnish',
            'date_of_birth' => '1989-08-28',
            'total_points' => 1,
            'driver_img' => 'store/drivers/bottas.jpg',
        ]);

        // Williams
        $albon = Driver::create([
            'first_name' => 'Alexander',
            'last_name' => 'Albon',
            'team_id' => $williams->id,
            'nationality' => 'Thai-British',
            'date_of_birth' => '1996-03-23',
            'total_points' => 37,
            'driver_img' => 'store/drivers/albon.jpg',
        ]);

        $colapinto = Driver::create([
            'first_name' => 'Franco',
            'last_name' => 'Colapinto',
            'team_id' => $williams->id,
            'nationality' => 'Argentine',
            'date_of_birth' => '2003-05-27',
            'total_points' => 5,
            'driver_img' => 'store/drivers/colapinto.jpg',
        ]);

        // Racing Bulls
        $tsunoda = Driver::create([
            'first_name' => 'Yuki',
            'last_name' => 'Tsunoda',
            'team_id' => $racingbulls->id,
            'nationality' => 'Japanese',
            'date_of_birth' => '2000-05-11',
            'total_points' => 19,
            'driver_img' => 'store/drivers/tsunoda.jpg',
        ]);

        $ricciardo = Driver::create([
            'first_name' => 'Daniel',
            'last_name' => 'Ricciardo',
            'team_id' => $racingbulls->id,
            'nationality' => 'Australian',
            'date_of_birth' => '1989-07-01',
            'total_points' => 8,
            'driver_img' => 'store/drivers/ricciardo.jpg',
        ]);

        // ===== CREATE 20 F1 CARS =====
        // Red Bull Racing - 2 cars
        Cars::create([
            'car_number' => '1',
            'model' => 'RB20',
            'brand' => 'Red Bull',
            'chassis' => 'RB20-001',
            'team_id' => $redbull->id,
            'driver_id' => $verstappen->id,
            'engine' => 'Honda RBPT V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Navy Blue & Gold',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/redbull_rb20.jpg',
            'top_speed' => 378,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '11',
            'model' => 'RB20',
            'brand' => 'Red Bull',
            'chassis' => 'RB20-002',
            'team_id' => $redbull->id,
            'driver_id' => $perez->id,
            'engine' => 'Honda RBPT V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Navy Blue & Gold',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/redbull_rb20_2.jpg',
            'top_speed' => 378,
            'status' => 'active',
        ]);

        // Mercedes - 2 cars
        Cars::create([
            'car_number' => '44',
            'model' => 'W15',
            'brand' => 'Mercedes',
            'chassis' => 'W15-001',
            'team_id' => $mercedes->id,
            'driver_id' => $hamilton->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Silver & Black',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/mercedes_w15.jpg',
            'top_speed' => 371,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '63',
            'model' => 'W15',
            'brand' => 'Mercedes',
            'chassis' => 'W15-002',
            'team_id' => $mercedes->id,
            'driver_id' => $russell->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Silver & Black',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/mercedes_w15_2.jpg',
            'top_speed' => 371,
            'status' => 'active',
        ]);

        // Ferrari - 2 cars
        Cars::create([
            'car_number' => '16',
            'model' => 'SF-24',
            'brand' => 'Ferrari',
            'chassis' => 'SF-24-001',
            'team_id' => $ferrari->id,
            'driver_id' => $leclerc->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Rosso Corsa Red',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/ferrari_sf24.jpg',
            'top_speed' => 373,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '55',
            'model' => 'SF-24',
            'brand' => 'Ferrari',
            'chassis' => 'SF-24-002',
            'team_id' => $ferrari->id,
            'driver_id' => $sainz->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Rosso Corsa Red',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/ferrari_sf24_2.jpg',
            'top_speed' => 373,
            'status' => 'active',
        ]);

        // McLaren - 2 cars
        Cars::create([
            'car_number' => '4',
            'model' => 'MCL38',
            'brand' => 'McLaren',
            'chassis' => 'MCL38-001',
            'team_id' => $mclaren->id,
            'driver_id' => $norris->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Papaya Orange',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/mclaren_mcl38.jpg',
            'top_speed' => 368,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '81',
            'model' => 'MCL38',
            'brand' => 'McLaren',
            'chassis' => 'MCL38-002',
            'team_id' => $mclaren->id,
            'driver_id' => $piastri->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Papaya Orange',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/mclaren_mcl38_2.jpg',
            'top_speed' => 368,
            'status' => 'active',
        ]);

        // Aston Martin - 2 cars
        Cars::create([
            'car_number' => '14',
            'model' => 'AMR24',
            'brand' => 'Aston Martin',
            'chassis' => 'AMR24-001',
            'team_id' => $astonmartin->id,
            'driver_id' => $alonso->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'British Racing Green',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/aston_amr24.jpg',
            'top_speed' => 370,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '18',
            'model' => 'AMR24',
            'brand' => 'Aston Martin',
            'chassis' => 'AMR24-002',
            'team_id' => $astonmartin->id,
            'driver_id' => $stroll->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'British Racing Green',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/aston_amr24_2.jpg',
            'top_speed' => 370,
            'status' => 'active',
        ]);

        // Alpine - 2 cars
        Cars::create([
            'car_number' => '10',
            'model' => 'A524',
            'brand' => 'Alpine',
            'chassis' => 'A524-001',
            'team_id' => $alpine->id,
            'driver_id' => $gasly->id,
            'engine' => 'Renault V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Alpine Blue',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/alpine_a524.jpg',
            'top_speed' => 367,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '31',
            'model' => 'A524',
            'brand' => 'Alpine',
            'chassis' => 'A524-002',
            'team_id' => $alpine->id,
            'driver_id' => $ocon->id,
            'engine' => 'Renault V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Alpine Blue',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/alpine_a524_2.jpg',
            'top_speed' => 367,
            'status' => 'active',
        ]);

        // Haas - 2 cars
        Cars::create([
            'car_number' => '20',
            'model' => 'VF-24',
            'brand' => 'Haas',
            'chassis' => 'VF-24-001',
            'team_id' => $haas->id,
            'driver_id' => $magnussen->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Gunmetal Grey',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/haas_vf24.jpg',
            'top_speed' => 365,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '27',
            'model' => 'VF-24',
            'brand' => 'Haas',
            'chassis' => 'VF-24-002',
            'team_id' => $haas->id,
            'driver_id' => $hulkenberg->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Gunmetal Grey',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/haas_vf24_2.jpg',
            'top_speed' => 365,
            'status' => 'active',
        ]);

        // Kick Sauber - 2 cars
        Cars::create([
            'car_number' => '24',
            'model' => 'C44',
            'brand' => 'Sauber',
            'chassis' => 'C44-001',
            'team_id' => $kicksauber->id,
            'driver_id' => $zhou->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Dark Green',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/sauber_c44.jpg',
            'top_speed' => 364,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '77',
            'model' => 'C44',
            'brand' => 'Sauber',
            'chassis' => 'C44-002',
            'team_id' => $kicksauber->id,
            'driver_id' => $bottas->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Dark Green',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/sauber_c44_2.jpg',
            'top_speed' => 364,
            'status' => 'active',
        ]);

        // Williams - 2 cars
        Cars::create([
            'car_number' => '23',
            'model' => 'FW46',
            'brand' => 'Williams',
            'chassis' => 'FW46-001',
            'team_id' => $williams->id,
            'driver_id' => $albon->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Cyan Blue',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/williams_fw46.jpg',
            'top_speed' => 366,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '2',
            'model' => 'FW46',
            'brand' => 'Williams',
            'chassis' => 'FW46-002',
            'team_id' => $williams->id,
            'driver_id' => $colapinto->id,
            'engine' => 'Mercedes-AMG F1 M16',
            'year' => 2024,
            'color' => 'Cyan Blue',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/williams_fw46_2.jpg',
            'top_speed' => 366,
            'status' => 'active',
        ]);

        // Racing Bulls - 2 cars
        Cars::create([
            'car_number' => '22',
            'model' => 'VCARB01',
            'brand' => 'Racing Bulls',
            'chassis' => 'VCARB01-001',
            'team_id' => $racingbulls->id,
            'driver_id' => $tsunoda->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Dark Blue & White',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/racing_bulls_vcarb01.jpg',
            'top_speed' => 362,
            'status' => 'active',
        ]);

        Cars::create([
            'car_number' => '3',
            'model' => 'VCARB01',
            'brand' => 'Racing Bulls',
            'chassis' => 'VCARB01-002',
            'team_id' => $racingbulls->id,
            'driver_id' => $ricciardo->id,
            'engine' => 'Ferrari V6 Hybrid Turbo',
            'year' => 2024,
            'color' => 'Dark Blue & White',
            'horsepower' => 1050,
            'weight' => 798,
            'image' => 'store/cars/racing_bulls_vcarb01_2.jpg',
            'top_speed' => 362,
            'status' => 'active',
        ]);

        // ===== CREATE TANGER RACES =====
        Race::create([
            'name' => 'Tanger Spring Grand Prix',
            'location' => 'Tanger, Morocco',
            'date' => '2025-03-15',
            'start_time' => '14:00',
            'status' => 'scheduled',
            'price' => 280.00,
            'img' => 'store/races/tanger_spring.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Summer Championship',
            'location' => 'Tanger, Morocco',
            'date' => '2025-06-21',
            'start_time' => '17:00',
            'status' => 'scheduled',
            'price' => 320.00,
            'img' => 'store/races/tanger_summer.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Autumn Grand Prix',
            'location' => 'Tanger, Morocco',
            'date' => '2025-09-14',
            'start_time' => '15:00',
            'status' => 'scheduled',
            'price' => 300.00,
            'img' => 'store/races/tanger_autumn.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Winter Challenge',
            'location' => 'Tanger, Morocco',
            'date' => '2025-12-07',
            'start_time' => '14:30',
            'status' => 'scheduled',
            'price' => 290.00,
            'img' => 'store/races/tanger_winter.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Night Race',
            'location' => 'Tanger, Morocco',
            'date' => '2025-05-10',
            'start_time' => '20:00',
            'status' => 'scheduled',
            'price' => 350.00,
            'img' => 'store/races/tanger_night.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Circuit Masters',
            'location' => 'Tanger, Morocco',
            'date' => '2025-07-26',
            'start_time' => '16:00',
            'status' => 'scheduled',
            'price' => 310.00,
            'img' => 'store/races/tanger_masters.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Express Grand Prix',
            'location' => 'Tanger, Morocco',
            'date' => '2025-04-05',
            'start_time' => '13:00',
            'status' => 'scheduled',
            'price' => 270.00,
            'img' => 'store/races/tanger_express.jpg',
        ]);

        Race::create([
            'name' => 'Tanger Final Cup',
            'location' => 'Tanger, Morocco',
            'date' => '2025-11-15',
            'start_time' => '15:30',
            'status' => 'scheduled',
            'price' => 330.00,
            'img' => 'store/races/tanger_final.jpg',
        ]);

        // ===== CREATE TEAM USERS =====
        // Create a test team user who manages Red Bull
        $teamUser = User::create([
            'name' => 'Red Bull Team Manager',
            'email' => 'team@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Assign the Red Bull team to this team user
        $redbull->user_id = $teamUser->id;
        $redbull->save();

        // Assign 'team' role to this user
        $teamUser->syncRoles(['team']);

        // ===== POPULATE STANDINGS TABLE (CHAMPIONSHIP RANKINGS) =====
        // Real 2024/2025 F1 Championship points (out of 24 races)
        Standing::create(['team_id' => $redbull->id, 'driver_id' => $verstappen->id, 'points' => 412, 'year' => 2024]);
        Standing::create(['team_id' => $ferrari->id, 'driver_id' => $leclerc->id, 'points' => 380, 'year' => 2024]);
        Standing::create(['team_id' => $mercedes->id, 'driver_id' => $hamilton->id, 'points' => 356, 'year' => 2024]);
        Standing::create(['team_id' => $mercedes->id, 'driver_id' => $russell->id, 'points' => 341, 'year' => 2024]);
        Standing::create(['team_id' => $ferrari->id, 'driver_id' => $sainz->id, 'points' => 328, 'year' => 2024]);
        Standing::create(['team_id' => $mclaren->id, 'driver_id' => $norris->id, 'points' => 310, 'year' => 2024]);
        Standing::create(['team_id' => $mclaren->id, 'driver_id' => $piastri->id, 'points' => 298, 'year' => 2024]);
        Standing::create(['team_id' => $redbull->id, 'driver_id' => $perez->id, 'points' => 285, 'year' => 2024]);
        Standing::create(['team_id' => $astonmartin->id, 'driver_id' => $alonso->id, 'points' => 223, 'year' => 2024]);
        Standing::create(['team_id' => $alpine->id, 'driver_id' => $gasly->id, 'points' => 155, 'year' => 2024]);
        Standing::create(['team_id' => $alpine->id, 'driver_id' => $ocon->id, 'points' => 142, 'year' => 2024]);
        Standing::create(['team_id' => $haas->id, 'driver_id' => $hulkenberg->id, 'points' => 61, 'year' => 2024]);
        Standing::create(['team_id' => $astonmartin->id, 'driver_id' => $stroll->id, 'points' => 74, 'year' => 2024]);
        Standing::create(['team_id' => $williams->id, 'driver_id' => $albon->id, 'points' => 37, 'year' => 2024]);
        Standing::create(['team_id' => $haas->id, 'driver_id' => $magnussen->id, 'points' => 26, 'year' => 2024]);
        Standing::create(['team_id' => $racingbulls->id, 'driver_id' => $tsunoda->id, 'points' => 19, 'year' => 2024]);
        Standing::create(['team_id' => $racingbulls->id, 'driver_id' => $ricciardo->id, 'points' => 8, 'year' => 2024]);
        Standing::create(['team_id' => $williams->id, 'driver_id' => $colapinto->id, 'points' => 5, 'year' => 2024]);
        Standing::create(['team_id' => $kicksauber->id, 'driver_id' => $zhou->id, 'points' => 6, 'year' => 2024]);
        Standing::create(['team_id' => $kicksauber->id, 'driver_id' => $bottas->id, 'points' => 1, 'year' => 2024]);

        echo "\n✅ F1 2024 Season Data Seeded Successfully!\n";
        echo "✅ Created 10 Teams\n";
        echo "✅ Created 20 Drivers\n";
        echo "✅ Created 20 Cars\n";
        echo "✅ Created 8 Tanger Races\n";
        echo "✅ Populated Standings Table with Championship Points\n";
    }
}
