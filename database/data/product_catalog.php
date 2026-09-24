<?php

/*
 * Data katalog contoh untuk ProductCatalogSeeder.
 * "emoji" hanya dipakai untuk membuat ilustrasi gambar di public/images/products.
 */

return [
    [
        'name' => 'Elektronik',
        'code' => 'ELK',
        'color' => ['#dbeafe', '#93c5fd'],
        'products' => [
            ['name' => 'Mouse Wireless Silent Click', 'emoji' => '🖱️', 'price' => 125000, 'stock' => 48, 'description' => 'Mouse nirkabel 2.4 GHz dengan klik senyap, DPI hingga 1600, dan baterai tahan sampai 12 bulan. Nyaman untuk kerja maupun kuliah.'],
            ['name' => 'Keyboard Mekanik RGB', 'emoji' => '⌨️', 'price' => 489000, 'stock' => 22, 'description' => 'Keyboard mekanik 87 tombol dengan switch biru yang taktil, lampu RGB yang bisa diatur, dan kabel USB-C yang bisa dilepas.'],
            ['name' => 'Headphone Bluetooth Noise Cancelling', 'emoji' => '🎧', 'price' => 799000, 'stock' => 15, 'description' => 'Headphone over-ear dengan peredam bising aktif, baterai hingga 30 jam, dan bantalan telinga empuk untuk dipakai lama.'],
            ['name' => 'Power Bank 20000mAh Fast Charging', 'emoji' => '🔋', 'price' => 259000, 'stock' => 60, 'description' => 'Power bank berkapasitas 20000mAh dengan pengisian cepat 22.5W, dua port USB-A dan satu port USB-C.'],
            ['name' => 'Smartwatch Fitness Tracker', 'emoji' => '⌚', 'price' => 649000, 'stock' => 18, 'description' => 'Jam pintar dengan pemantau detak jantung, SpO2, langkah harian, dan notifikasi ponsel. Tahan air hingga 5 ATM.'],
        ],
    ],
    [
        'name' => 'Fashion Pria',
        'code' => 'FPR',
        'color' => ['#e0e7ff', '#a5b4fc'],
        'products' => [
            ['name' => 'Kemeja Flanel Kotak Lengan Panjang', 'emoji' => '👔', 'price' => 179000, 'stock' => 35, 'description' => 'Kemeja flanel katun motif kotak, lembut dan hangat. Cocok dipakai santai atau dilapis kaos.'],
            ['name' => 'Kaos Polos Cotton Combed 30s', 'emoji' => '👕', 'price' => 69000, 'stock' => 120, 'description' => 'Kaos polos bahan cotton combed 30s yang adem dan menyerap keringat. Tersedia ukuran S sampai XXL.'],
            ['name' => 'Celana Jeans Slim Fit', 'emoji' => '👖', 'price' => 249000, 'stock' => 40, 'description' => 'Celana jeans denim stretch potongan slim fit, nyaman untuk aktivitas sehari-hari.'],
            ['name' => 'Topi Baseball Polos', 'emoji' => '🧢', 'price' => 59000, 'stock' => 75, 'description' => 'Topi baseball bahan drill dengan strap belakang yang bisa diatur. Simpel dan mudah dipadukan.'],
            ['name' => 'Jaket Hoodie Fleece', 'emoji' => '🧥', 'price' => 219000, 'stock' => 30, 'description' => 'Hoodie bahan fleece tebal dengan kantong depan dan tali serut. Hangat untuk cuaca dingin.'],
        ],
    ],
    [
        'name' => 'Fashion Wanita',
        'code' => 'FWN',
        'color' => ['#fce7f3', '#f9a8d4'],
        'products' => [
            ['name' => 'Dress Casual Midi', 'emoji' => '👗', 'price' => 229000, 'stock' => 28, 'description' => 'Dress midi bahan rayon yang jatuh dan ringan, potongan A-line yang cocok untuk jalan santai.'],
            ['name' => 'Blouse Katun Lengan Balon', 'emoji' => '👚', 'price' => 139000, 'stock' => 45, 'description' => 'Blouse katun dengan detail lengan balon, nyaman untuk kerja maupun hangout.'],
            ['name' => 'Tas Selempang Kulit Sintetis', 'emoji' => '👜', 'price' => 189000, 'stock' => 32, 'description' => 'Tas selempang ukuran sedang dengan tali yang bisa diatur, muat ponsel, dompet, dan kosmetik kecil.'],
            ['name' => 'Sepatu Heels 5 cm', 'emoji' => '👠', 'price' => 279000, 'stock' => 20, 'description' => 'Sepatu heels setinggi 5 cm dengan insole empuk, elegan untuk acara formal.'],
            ['name' => 'Kacamata Hitam UV400', 'emoji' => '🕶️', 'price' => 99000, 'stock' => 55, 'description' => 'Kacamata hitam dengan lensa UV400 yang melindungi mata dari sinar matahari. Frame ringan.'],
        ],
    ],
    [
        'name' => 'Olahraga',
        'code' => 'OLR',
        'color' => ['#dcfce7', '#86efac'],
        'products' => [
            ['name' => 'Sepatu Lari Ringan', 'emoji' => '👟', 'price' => 459000, 'stock' => 25, 'description' => 'Sepatu lari dengan upper mesh yang bernapas dan midsole empuk untuk lari harian.'],
            ['name' => 'Bola Sepak Ukuran 5', 'emoji' => '⚽', 'price' => 179000, 'stock' => 40, 'description' => 'Bola sepak ukuran 5 standar pertandingan, jahitan kuat dan cocok untuk lapangan rumput.'],
            ['name' => 'Raket Badminton Carbon', 'emoji' => '🏸', 'price' => 349000, 'stock' => 18, 'description' => 'Raket badminton rangka carbon yang ringan dan kaku, sudah termasuk senar dan tas raket.'],
            ['name' => 'Matras Yoga Anti Slip 6 mm', 'emoji' => '🧘', 'price' => 159000, 'stock' => 36, 'description' => 'Matras yoga tebal 6 mm dengan permukaan anti slip, dilengkapi tali untuk dibawa.'],
            ['name' => 'Sarung Tinju 12 oz', 'emoji' => '🥊', 'price' => 239000, 'stock' => 14, 'description' => 'Sarung tinju 12 oz dengan busa berlapis untuk latihan samsak maupun sparring.'],
        ],
    ],
    [
        'name' => 'Makanan & Minuman',
        'code' => 'MKN',
        'color' => ['#fef3c7', '#fcd34d'],
        'products' => [
            ['name' => 'Kopi Arabika Gayo 250 gr', 'emoji' => '☕', 'price' => 89000, 'stock' => 80, 'description' => 'Biji kopi arabika Gayo sangrai medium, aroma rempah dan rasa cokelat yang lembut.'],
            ['name' => 'Cokelat Batang Dark 70%', 'emoji' => '🍫', 'price' => 35000, 'stock' => 150, 'description' => 'Cokelat hitam 70% kakao dari biji kakao lokal, pahit manis dan kaya rasa.'],
            ['name' => 'Madu Hutan Murni 500 gr', 'emoji' => '🍯', 'price' => 115000, 'stock' => 42, 'description' => 'Madu hutan murni tanpa campuran, dipanen langsung dari hutan Sumbawa.'],
            ['name' => 'Kue Nastar Premium', 'emoji' => '🍪', 'price' => 95000, 'stock' => 30, 'description' => 'Nastar isi selai nanas asli dengan butter premium, lembut dan lumer di mulut. Isi 500 gr.'],
            ['name' => 'Teh Hijau Celup Isi 25', 'emoji' => '🍵', 'price' => 29000, 'stock' => 110, 'description' => 'Teh hijau celup dengan rasa segar dan ringan, cocok diminum panas maupun dingin.'],
        ],
    ],
    [
        'name' => 'Rumah Tangga',
        'code' => 'RMT',
        'color' => ['#ffedd5', '#fdba74'],
        'products' => [
            ['name' => 'Lampu Meja LED Dimmable', 'emoji' => '💡', 'price' => 149000, 'stock' => 38, 'description' => 'Lampu meja LED dengan tiga mode warna dan tingkat terang yang bisa diatur. Hemat energi.'],
            ['name' => 'Tanaman Hias Monstera dengan Pot', 'emoji' => '🪴', 'price' => 175000, 'stock' => 16, 'description' => 'Tanaman monstera deliciosa setinggi kurang lebih 40 cm lengkap dengan pot keramik.'],
            ['name' => 'Wajan Anti Lengket 24 cm', 'emoji' => '🍳', 'price' => 199000, 'stock' => 27, 'description' => 'Wajan lapisan anti lengket 24 cm, bisa dipakai di kompor gas maupun induksi.'],
            ['name' => 'Jam Dinding Minimalis', 'emoji' => '🕰️', 'price' => 119000, 'stock' => 24, 'description' => 'Jam dinding diameter 30 cm dengan mesin sweep yang tidak berdetak, desain minimalis.'],
            ['name' => 'Lilin Aromaterapi Lavender', 'emoji' => '🕯️', 'price' => 65000, 'stock' => 64, 'description' => 'Lilin aromaterapi soy wax wangi lavender, durasi nyala sekitar 30 jam.'],
        ],
    ],
    [
        'name' => 'Kecantikan',
        'code' => 'KCT',
        'color' => ['#f3e8ff', '#d8b4fe'],
        'products' => [
            ['name' => 'Lipstik Matte Tahan Lama', 'emoji' => '💄', 'price' => 79000, 'stock' => 70, 'description' => 'Lipstik matte dengan pigmen pekat yang tahan hingga 12 jam dan tidak membuat bibir kering.'],
            ['name' => 'Body Lotion Aloe Vera 250 ml', 'emoji' => '🧴', 'price' => 55000, 'stock' => 90, 'description' => 'Body lotion dengan ekstrak aloe vera yang melembapkan dan cepat meresap.'],
            ['name' => 'Sabun Mandi Organik', 'emoji' => '🧼', 'price' => 32000, 'stock' => 120, 'description' => 'Sabun batang organik dari minyak kelapa dan minyak zaitun, lembut untuk kulit sensitif.'],
            ['name' => 'Cermin Rias LED', 'emoji' => '🪞', 'price' => 165000, 'stock' => 21, 'description' => 'Cermin rias dengan lampu LED di sekelilingnya dan pengaturan tingkat terang.'],
            ['name' => 'Kutek Kuku Quick Dry', 'emoji' => '💅', 'price' => 39000, 'stock' => 85, 'description' => 'Kutek kuku yang cepat kering dalam 60 detik dengan hasil akhir mengilap.'],
        ],
    ],
    [
        'name' => 'Buku & Alat Tulis',
        'code' => 'BAT',
        'color' => ['#ccfbf1', '#5eead4'],
        'products' => [
            ['name' => 'Novel Fiksi Petualangan', 'emoji' => '📕', 'price' => 98000, 'stock' => 44, 'description' => 'Novel fiksi petualangan setebal 320 halaman yang seru dibaca di waktu senggang.'],
            ['name' => 'Buku Catatan Hardcover A5', 'emoji' => '📓', 'price' => 45000, 'stock' => 100, 'description' => 'Buku catatan A5 sampul keras dengan 160 halaman kertas bergaris 80 gsm.'],
            ['name' => 'Pulpen Gel 0.5 mm Isi 12', 'emoji' => '🖊️', 'price' => 36000, 'stock' => 130, 'description' => 'Satu set 12 pulpen gel 0.5 mm dengan tinta hitam yang lancar dan cepat kering.'],
            ['name' => 'Krayon Warna Isi 24', 'emoji' => '🖍️', 'price' => 42000, 'stock' => 58, 'description' => 'Krayon 24 warna yang aman untuk anak, warnanya cerah dan tidak mudah patah.'],
            ['name' => 'Tas Ransel Sekolah', 'emoji' => '🎒', 'price' => 215000, 'stock' => 26, 'description' => 'Tas ransel dengan kompartemen laptop 14 inci, bahan tahan air, dan punggung empuk.'],
        ],
    ],
];
