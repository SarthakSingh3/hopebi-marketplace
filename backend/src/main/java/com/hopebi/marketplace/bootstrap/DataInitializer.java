package com.hopebi.marketplace.bootstrap;

import com.hopebi.marketplace.address.Address;
import com.hopebi.marketplace.address.AddressRepository;
import com.hopebi.marketplace.category.Category;
import com.hopebi.marketplace.category.CategoryRepository;
import com.hopebi.marketplace.order.*;
import com.hopebi.marketplace.payment.PaymentMethod;
import com.hopebi.marketplace.product.*;
import com.hopebi.marketplace.promotion.Promotion;
import com.hopebi.marketplace.promotion.PromotionRepository;
import com.hopebi.marketplace.promotion.PromotionType;
import com.hopebi.marketplace.review.Review;
import com.hopebi.marketplace.review.ReviewRepository;
import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerRepository;
import com.hopebi.marketplace.seller.SellerStatus;
import com.hopebi.marketplace.seller.SellerVerificationStatus;
import com.hopebi.marketplace.shipping.FulfilmentStatus;
import com.hopebi.marketplace.user.Role;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final PromotionRepository promotionRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SellerRepository sellerRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           AddressRepository addressRepository,
                           PromotionRepository promotionRepository,
                           OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.promotionRepository = promotionRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Seeding initial data for HOPEBI Indian B2C Marketplace...");

        // 1. Create Core Users
        User admin = userRepository.save(new User(
                "HOPEBI Administrator",
                "admin@hopebi.com",
                "+919876543210",
                passwordEncoder.encode("AdminPassword123!"),
                Role.ROLE_ADMIN
        ));

        User demoSellerUser = userRepository.save(new User(
                "Vikram Sharma",
                "seller@hopebi.com",
                "+919811223344",
                passwordEncoder.encode("SellerPassword123!"),
                Role.ROLE_SELLER
        ));

        User demoCustomer = userRepository.save(new User(
                "Ananya Iyer",
                "customer@hopebi.com",
                "+919822334455",
                passwordEncoder.encode("CustomerPassword123!"),
                Role.ROLE_CUSTOMER
        ));

        // 2. Customer Saved Address
        Address customerAddress = addressRepository.save(new Address(
                demoCustomer,
                "Ananya Iyer",
                "9822334455",
                "#402, Shanti Vihar Apartments, 12th Main Road",
                "Indiranagar",
                "Bengaluru",
                "Karnataka",
                "560038",
                "Near BDA Complex",
                "HOME",
                true
        ));

        // 3. Promotions / Coupons
        promotionRepository.save(new Promotion(
                "HOPEBI50",
                "Flat ₹500 off on orders above ₹1,999",
                PromotionType.FLAT_AMOUNT,
                BigDecimal.valueOf(500),
                BigDecimal.valueOf(1999),
                null,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusMonths(6)
        ));

        promotionRepository.save(new Promotion(
                "FIRST10",
                "10% off for first-time discoveries (Max ₹300)",
                PromotionType.PERCENTAGE,
                BigDecimal.valueOf(10),
                BigDecimal.valueOf(499),
                BigDecimal.valueOf(300),
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusMonths(6)
        ));

        // 4. Categories
        Category catCookware = categoryRepository.save(new Category(
                "Artisanal Cookware & Dining",
                "artisanal-cookware",
                "Handcrafted Kansa bronze, soapstone, and pure iron cookware made by regional metallurgists.",
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
                1
        ));

        Category catBrassCopper = categoryRepository.save(new Category(
                "Pure Brass & Copper Craft",
                "brass-and-copper",
                "Hammered brass water vessels, copper carafes, and traditional lamps made with ancient metallurgy.",
                "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80",
                2
        ));

        Category catTeaSpices = categoryRepository.save(new Category(
                "Specialty Teas & Spices",
                "teas-and-spices",
                "Estate-grown loose teas and whole sun-dried spices sourced directly from mountain plantations.",
                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
                3
        ));

        Category catHandlooms = categoryRepository.save(new Category(
                "Sustainable Handlooms",
                "sustainable-handlooms",
                "Authentic handwoven textiles, organic cotton dupattas, and pure wool shawls from master weavers.",
                "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80",
                4
        ));

        Category catCeramics = categoryRepository.save(new Category(
                "Heritage Pottery & Ceramics",
                "heritage-pottery",
                "Lead-free wheel-thrown ceramics, terracotta pots, and Jaipur blue pottery art pieces.",
                "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
                5
        ));

        Category catLeather = categoryRepository.save(new Category(
                "Handcrafted Leatherware",
                "handcrafted-leatherware",
                "Vegetable-tanned full-grain leather footwear and bags crafted by generation-old artisan guilds.",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
                6
        ));

        Category catToysWood = categoryRepository.save(new Category(
                "Natural Wood & Toys",
                "natural-wood-craft",
                "GI-tagged safe wooden playthings and hand-carved walnut wood home accents.",
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
                7
        ));

        // 5. 10 Curated Indian Manufacturers (Fictional / Emerging sample brands)
        List<SellerProfile> sellers = new ArrayList<>();

        // 1. Moradabad Metalcrafts Guild (Linked to demo seller user)
        SellerProfile s1 = new SellerProfile(
                demoSellerUser,
                "Moradabad Metalcrafts Guild",
                "moradabad-metalcrafts-guild",
                "Three generations of brass foundry masters creating non-reactive cookware and embossed home vessels.",
                "Moradabad", "Uttar Pradesh",
                "Founded in 1968, sustaining over 40 traditional metal-beaters in Uttar Pradesh.",
                "+919811223344", "seller@hopebi.com", "09AABCM1234F1Z8"
        );
        s1.setSellerStatus(SellerStatus.APPROVED);
        s1.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        s1.setCommissionRate(5.0);
        s1.setLogoUrl("https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=150&q=80");
        sellers.add(sellerRepository.save(s1));

        // 2. Kansa Artisans of Gujarat
        User u2 = createUser("Hasmukh Patel", "hasmukh@kansa-gujarat.example.in", "+919711223344");
        SellerProfile s2 = new SellerProfile(
                u2, "Kansa Artisans of Gujarat", "kansa-artisans-of-gujarat",
                "Specialists in hand-beaten bell metal (78% Copper, 22% Tin) dining ware according to Ayurvedic metallurgy.",
                "Patan", "Gujarat",
                "Practicing unbroken bell-metal casting since 1952 in North Gujarat.",
                "+919711223344", "contact@kansa-gujarat.example.in", "24AABCK5678G1Z2"
        );
        s2.setSellerStatus(SellerStatus.APPROVED);
        s2.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s2));

        // 3. Nilgiri Mist Estate Teas
        User u3 = createUser("Rohan Fernandez", "rohan@nilgirimist.example.in", "+919441223344");
        SellerProfile s3 = new SellerProfile(
                u3, "Nilgiri Mist Estate Teas", "nilgiri-mist-estate-teas",
                "High-elevation family-owned tea estate producing single-flush orthodox silver tips and aromatic winter teas.",
                "Coonoor", "Tamil Nadu",
                "Sustainable biodiversity-focused estate located at 6,500 feet elevation.",
                "+919441223344", "info@nilgirimist.example.in", "33AABCN9012H1Z5"
        );
        s3.setSellerStatus(SellerStatus.APPROVED);
        s3.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s3));

        // 4. Kashmir Loom & Weft
        User u4 = createUser("Bashir Mir", "bashir@kashmirloom.example.in", "+919191223344");
        SellerProfile s4 = new SellerProfile(
                u4, "Kashmir Loom & Weft", "kashmir-loom-and-weft",
                "Family weaver guild specializing in pure Pashmina and hand-spun fine Merino wool stoles.",
                "Srinagar", "Jammu and Kashmir",
                "Carrying forward royal Kashmiri sozni and kani embroidery patterns.",
                "+919191223344", "care@kashmirloom.example.in", "01AABCK3456I1Z9"
        );
        s4.setSellerStatus(SellerStatus.APPROVED);
        s4.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s4));

        // 5. Channapatna Toy Collective
        User u5 = createUser("Manjunath Gowda", "manju@channapatna.example.in", "+919981223344");
        SellerProfile s5 = new SellerProfile(
                u5, "Channapatna Toy Collective", "channapatna-toy-collective",
                "Makers of GI-tagged wooden toys and tabletop games finished with non-toxic vegetable dyes.",
                "Channapatna", "Karnataka",
                "Preserving the 200-year ivory wood lathe-craft supported by village cooperatives.",
                "+919981223344", "order@channapatna.example.in", "29AABCJ7890J1Z3"
        );
        s5.setSellerStatus(SellerStatus.APPROVED);
        s5.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s5));

        // 6. Khurja Ceramics Workshop
        User u6 = createUser("Dinesh Sharma", "dinesh@khurjaceramics.example.in", "+919871223344");
        SellerProfile s6 = new SellerProfile(
                u6, "Khurja Ceramics Workshop", "khurja-ceramics-workshop",
                "Studio potters producing food-grade, high-fired stoneware kitchenware and artisanal coffee mugs.",
                "Khurja", "Uttar Pradesh",
                "Third-generation kiln operators modernizing classic ceramic glazes.",
                "+919871223344", "hello@khurjaceramics.example.in", "09AABCD2345K1Z7"
        );
        s6.setSellerStatus(SellerStatus.APPROVED);
        s6.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s6));

        // 7. Malabar Spice Harvesters
        User u7 = createUser("Jose Mathew", "jose@malabarspice.example.in", "+919481223344");
        SellerProfile s7 = new SellerProfile(
                u7, "Malabar Spice Harvesters", "malabar-spice-harvesters",
                "Direct farm cooperative supplying single-estate whole tellicherry black pepper, green cardamom, and wild turmeric.",
                "Idukki", "Kerala",
                "Fair-trade spice grower network promoting regenerative forest agriculture.",
                "+919481223344", "growers@malabarspice.example.in", "32AABCM6789L1Z1"
        );
        s7.setSellerStatus(SellerStatus.APPROVED);
        s7.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s7));

        // 8. Kolhapuri Heritage Tannery
        User u8 = createUser("Santosh Chavan", "santosh@kolhapuri.example.in", "+919891223344");
        SellerProfile s8 = new SellerProfile(
                u8, "Kolhapuri Heritage Tannery", "kolhapuri-heritage-tannery",
                "Authentic handcrafted Kolhapuri chappals and hand-stitched leather wallets using natural babul bark tanning.",
                "Kolhapur", "Maharashtra",
                "Registered GI artisan cluster crafting supple, breathable traditional leather footwear.",
                "+919891223344", "leather@kolhapuri.example.in", "27AABCK0123M1Z4"
        );
        s8.setSellerStatus(SellerStatus.APPROVED);
        s8.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s8));

        // 9. Jaipur Blue Glaze Guild
        User u9 = createUser("Kailash Chand", "kailash@jaipurblue.example.in", "+919821223344");
        SellerProfile s9 = new SellerProfile(
                u9, "Jaipur Blue Glaze Guild", "jaipur-blue-glaze-guild",
                "Non-clay quartz Egyptian pottery studio hand-painting cobalt floral motifs on serveware and wall plates.",
                "Jaipur", "Rajasthan",
                "Award-winning artisan workshop preserving traditional Rajasthani blue pottery.",
                "+919821223344", "guild@jaipurblue.example.in", "08AABCJ4567N1Z8"
        );
        s9.setSellerStatus(SellerStatus.APPROVED);
        s9.setVerificationStatus(SellerVerificationStatus.VERIFIED);
        sellers.add(sellerRepository.save(s9));

        // 10. Dharwad Pure Naturals (Pending verification showcase)
        User u10 = createUser("Suresh Kulkarni", "suresh@dharwadnaturals.example.in", "+919831223344");
        SellerProfile s10 = new SellerProfile(
                u10, "Dharwad Pure Naturals", "dharwad-pure-naturals",
                "Cold-pressed wood churned oils and forest-harvested unpasteurized honey from the Western Ghats periphery.",
                "Dharwad", "Karnataka",
                "Direct farmer collective establishing transparent testing standards.",
                "+919831223344", "suresh@dharwadnaturals.example.in", "29AABCD8901O1Z2"
        );
        s10.setSellerStatus(SellerStatus.PENDING_APPROVAL); // Demo pending seller for admin testing
        s10.setVerificationStatus(SellerVerificationStatus.PENDING);
        sellerRepository.save(s10);

        // 6. Seed 20+ Demandable Curated Products
        List<Product> products = new ArrayList<>();

        // Products for Moradabad Metalcrafts Guild (s1)
        Product p1 = createProduct(
                s1, catBrassCopper,
                "Hand-Hammered Solid Brass Chai Pot (1.2L)",
                "hand-hammered-solid-brass-chai-pot",
                "MMG-BRS-01",
                "Solid heavy-gauge brass kettle with heat-insulating wooden handle, crafted by master metal-beaters in Moradabad.",
                "Experience traditional Indian tea brewing with this heavy-gauge brass kettle. The hammered dimples are individually formed by mallet, providing structural rigidity and distinctive artisanal beauty. Fitted with a precision pour spout and natural turned teakwood handle.",
                BigDecimal.valueOf(2499), BigDecimal.valueOf(1999), 18,
                "Pure Brass & Seasoned Teak Wood", "Moradabad, Uttar Pradesh",
                "100% Solid Brass | Lead-Free Tin (Kalai) Lining | Hand-hammered",
                List.of("https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p1);

        Product p2 = createProduct(
                s1, catBrassCopper,
                "Ayurvedic Pure Copper Water Carafe & Tumbler Set",
                "ayurvedic-pure-copper-water-carafe-set",
                "MMG-CPR-02",
                "99.6% certified food-grade pure copper carafe with matching ergonomic tumbler.",
                "Handcrafted according to Ayurvedic traditions for overnight Tamra Jal preparation. Seamless construction prevents leaks, and the hammered exterior resists oxidation spotting while looking magnificent on your bedside or workspace.",
                BigDecimal.valueOf(1899), BigDecimal.valueOf(1499), 25,
                "99.6% Pure Food-Grade Copper", "Moradabad, Uttar Pradesh",
                "Certified Purity | Non-lacquered interior | Lab-tested copper",
                List.of("https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p2);

        // Products for Kansa Artisans of Gujarat (s2)
        Product p3 = createProduct(
                s2, catCookware,
                "Traditional Bronze Kansa Thali Dining Set (5-Piece)",
                "traditional-bronze-kansa-thali-dining-set",
                "KAG-KNS-01",
                "Pure bell metal bronze dinner set including thali, two bowls, dessert bowl, and glass.",
                "Hand-forged by hereditary Kansa artisans in Patan. Kansa (bell metal) is an alloy of 78% copper and 22% tin. According to the Charaka Samhita, eating from bronze balances Pitta dosha and improves digestive vitality.",
                BigDecimal.valueOf(4999), BigDecimal.valueOf(4299), 12,
                "78% Copper & 22% Tin (Pure Bronze)", "Patan, Gujarat",
                "Traditional Bell Metal | Hand-cast & Lathe Finished | Lifetime Durability",
                List.of("https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p3);

        Product p4 = createProduct(
                s2, catCookware,
                "Kansa Ayurvedic Foot Massager Bowl (Kansa Vatki)",
                "kansa-ayurvedic-foot-massager-bowl",
                "KAG-VTK-02",
                "Handheld bronze cup with rosewood grip for relaxing Pada-abhyanga foot massage.",
                "Used for centuries in holistic wellness to draw out excess heat from the body and soothe tired soles before rest. Perfect when paired with pure sesame or ghee.",
                BigDecimal.valueOf(1199), BigDecimal.valueOf(899), 30,
                "Bronze Bell Metal & Sheesham Wood", "Patan, Gujarat",
                "Authentic Alloy | Relieves Fatigue | Natural Detox",
                List.of("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p4);

        // Products for Nilgiri Mist Estate Teas (s3)
        Product p5 = createProduct(
                s3, catTeaSpices,
                "Nilgiri Winter Frost Orthodox Whole Leaf Tea (100g Tin)",
                "nilgiri-winter-frost-orthodox-tea",
                "NME-TEA-01",
                "Rare high-altitude winter harvest tea with delicate floral notes and sweet peach undertones.",
                "Plucked only between late December and early February when nighttime frost concentrates natural sugars in tea bushes grown at 6,500 feet. Golden infusion with zero bitterness.",
                BigDecimal.valueOf(750), BigDecimal.valueOf(649), 40,
                "100% Single-Estate Nilgiri Camellia Sinensis", "Coonoor, Tamil Nadu",
                "Pesticide-Free Estate | High-Grown Single Flush | Vacuum-Sealed Tin",
                List.of("https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p5);

        Product p6 = createProduct(
                s3, catTeaSpices,
                "Nilgiri Silver Needle White Tea (50g Rare Reserve)",
                "nilgiri-silver-needle-white-tea",
                "NME-TEA-02",
                "Delicately hand-plucked unbroken fuzzy tea buds sun-withered in mountain air.",
                "One of India's most prized white teas. Unoxidized buds produce a pale liquor with subtle notes of melon and wild honey.",
                BigDecimal.valueOf(950), null, 15,
                "Pure Sun-Withered White Tea Buds", "Coonoor, Tamil Nadu",
                "Limited Estate Batch | Zero Additives | High Antioxidants",
                List.of("https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p6);

        // Products for Kashmir Loom & Weft (s4)
        Product p7 = createProduct(
                s4, catHandlooms,
                "Pure Handwoven Pashmina Stole with Needle Sozni Border",
                "pure-handwoven-pashmina-stole-sozni",
                "KLW-PSH-01",
                "Authentic Changthangi goat fine cashmere handwoven on traditional pit looms in Srinagar.",
                "Weighing under 180 grams, this whisper-soft Pashmina is spun from the fine underfleece of Ladakh mountain goats. Detailed with delicate needle-worked border motifs by master artisans.",
                BigDecimal.valueOf(9800), BigDecimal.valueOf(7999), 8,
                "100% Pure Ladakhi Pashmina", "Srinagar, Jammu & Kashmir",
                "Hand-spun & Handwoven | GI Heritage Certified | Feather-light Warmth",
                List.of("https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p7);

        // Products for Channapatna Toy Collective (s5)
        Product p8 = createProduct(
                s5, catToysWood,
                "Organic Channapatna Wooden Balancing Stacking Birds",
                "channapatna-wooden-balancing-birds",
                "CTC-TOY-01",
                "Non-toxic vegetable-lacquered wooden balance play set for toddlers and young minds.",
                "Turned from seasoned Hale (Wrightia tinctoria) wood on traditional foot-lathes. Polished with non-toxic lac dyed naturally with turmeric, indigo, and kumkum. Completely child-safe.",
                BigDecimal.valueOf(899), BigDecimal.valueOf(699), 35,
                "Ivory Wood & Natural Lacquer Dyes", "Channapatna, Karnataka",
                "GI-Tagged Craft | 100% Non-Toxic Vegetable Dyes | Child-Safe",
                List.of("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p8);

        // Products for Khurja Ceramics Workshop (s6)
        Product p9 = createProduct(
                s6, catCeramics,
                "Rustic Stoneware Matte Glaze Ramen & Salad Bowls (Set of 2)",
                "rustic-stoneware-matte-glaze-bowls",
                "KCW-CRM-01",
                "1250°C high-fired food-safe ceramic studio bowls with speckled oatmeal glaze.",
                "Microwave and dishwasher safe. Hand-thrown on the potter's wheel in Khurja, these generous bowls feature subtle natural iron speckling and an ergonomic tactile rim.",
                BigDecimal.valueOf(1299), BigDecimal.valueOf(999), 20,
                "High-fired Ceramic Stoneware", "Khurja, Uttar Pradesh",
                "Lead-Free Glaze | Microwave & Dishwasher Safe | Chip-Resistant",
                List.of("https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p9);

        Product p10 = createProduct(
                s6, catCeramics,
                "Handcrafted Terracotta Chai Kulhad Cups (Set of 6, Glazed Interior)",
                "handcrafted-terracotta-chai-kulhad-set",
                "KCW-CRM-02",
                "Clay kulhad cups featuring glazed inner lining for everyday tea brewing.",
                "Enjoy the earthy aroma of natural clay without porosity leaks. The food-safe transparent glaze on the inside allows repeated dishwasher washing while preserving traditional rustic exterior grip.",
                BigDecimal.valueOf(799), BigDecimal.valueOf(599), 40,
                "Natural Red Clay Terracotta", "Khurja, Uttar Pradesh",
                "100% Food-Safe Glaze | Reusable | Heat-Retentive",
                List.of("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p10);

        // Products for Malabar Spice Harvesters (s7)
        Product p11 = createProduct(
                s7, catTeaSpices,
                "Single-Estate Bold Tellicherry Black Peppercorns (250g Jar)",
                "single-estate-bold-tellicherry-peppercorns",
                "MSH-SPC-01",
                "TGSEB (Tellicherry Garbled Special Extra Bold) sun-dried whole pepper berries from Wayanad slopes.",
                "Left to mature on the vine until bright red before hand-picking and sun-drying on bamboo mats. Robust heat with complex citrus and pine fragrance.",
                BigDecimal.valueOf(499), BigDecimal.valueOf(399), 50,
                "Whole Black Peppercorns", "Idukki, Kerala",
                "Single Origin | High Piperine (6.2%) | Zero Preservatives",
                List.of("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p11);

        // Products for Kolhapuri Heritage Tannery (s8)
        Product p12 = createProduct(
                s8, catLeather,
                "Traditional Hand-Braided Kolhapuri Leather Chappals",
                "traditional-hand-braided-kolhapuri-chappals",
                "KHT-LTH-01",
                "Hand-stitched vegetable-tanned genuine leather sandals with signature braided toe loop.",
                "Softens and shapes to your foot contour with wear. Handcrafted in Kolhapur using babul tree bark tanning without harsh chromium chemicals.",
                BigDecimal.valueOf(2299), BigDecimal.valueOf(1799), 16,
                "Vegetable-Tanned Full-Grain Buffalo Leather", "Kolhapur, Maharashtra",
                "GI Heritage Product | Vegetable-Tanned | Zero Synthetic Glue",
                List.of("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p12);

        // Products for Jaipur Blue Glaze Guild (s9)
        Product p13 = createProduct(
                s9, catCeramics,
                "Jaipur Blue Pottery Hand-Painted Decorative Platter (10-Inch)",
                "jaipur-blue-pottery-decorative-platter",
                "JBG-POT-01",
                "Traditional quartz blue pottery platter with cobalt Persian floral medallion.",
                "Unique among Indian pottery traditions, Jaipur blue pottery uses Egyptian paste formulated with powdered quartz, Fuller's earth, and natural gum rather than clay. Each piece is hand-painted with squirrel-hair brushes.",
                BigDecimal.valueOf(1499), BigDecimal.valueOf(1199), 14,
                "Egyptian Quartz Faience & Cobalt Glaze", "Jaipur, Rajasthan",
                "Hand-Painted | Heritage Quartz Medium | Fade-Proof Colors",
                List.of("https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80")
        );
        products.add(p13);

        // 7. Seed Sample Initial Order for Demo Customer (so reviews and order history are testable immediately!)
        Order sampleOrder = new Order(
                "HOP-20261014-9841A2",
                demoCustomer,
                PaymentMethod.TEST_SIMULATOR,
                p1.getEffectivePrice().add(p5.getEffectivePrice()),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.valueOf(132.40),
                p1.getEffectivePrice().add(p5.getEffectivePrice()),
                null,
                "{\"recipientName\":\"Ananya Iyer\",\"phoneNumber\":\"9822334455\",\"streetAddress\":\"#402, Shanti Vihar Apartments\",\"locality\":\"Indiranagar\",\"city\":\"Bengaluru\",\"state\":\"Karnataka\",\"pincode\":\"560038\"}",
                "SEED_DEMO_ORDER_KEY_1"
        );
        sampleOrder.setOrderStatus(OrderStatus.DELIVERED);
        sampleOrder.setPaymentStatus(PaymentStatus.PAID);
        Order savedSampleOrder = orderRepository.save(sampleOrder);

        OrderItem item1 = new OrderItem(
                savedSampleOrder, p1, s1,
                p1.getName(), p1.getSku(), p1.getEffectivePrice(), 1
        );
        item1.setFulfilmentStatus(FulfilmentStatus.DELIVERED);
        item1.setCarrier("Delhivery");
        item1.setTrackingNumber("DLV9811223344IN");
        item1.setDispatchedAt(LocalDateTime.now().minusDays(5));
        item1.setDeliveredAt(LocalDateTime.now().minusDays(2));
        orderItemRepository.save(item1);

        OrderItem item2 = new OrderItem(
                savedSampleOrder, p5, s3,
                p5.getName(), p5.getSku(), p5.getEffectivePrice(), 1
        );
        item2.setFulfilmentStatus(FulfilmentStatus.DELIVERED);
        item2.setCarrier("Blue Dart");
        item2.setTrackingNumber("BLD55667788IN");
        item2.setDispatchedAt(LocalDateTime.now().minusDays(4));
        item2.setDeliveredAt(LocalDateTime.now().minusDays(1));
        orderItemRepository.save(item2);

        // Seed Sample Review for p1
        reviewRepository.save(new Review(
                p1,
                demoCustomer,
                5,
                "Exceptional quality brass and authentic aroma!",
                "The heavy weight and hand-hammered dimples make this kettle a true kitchen centerpiece. The tea tastes markedly fuller compared to stainless steel. Delivery from Moradabad was fast and well-padded.",
                true
        ));

        log.info("HOPEBI Seed data successfully initialized with 10 manufacturers, 7 categories, 13 curated products, and demo accounts.");
    }

    private User createUser(String name, String email, String phone) {
        return userRepository.save(new User(
                name,
                email,
                phone,
                passwordEncoder.encode("Password123!"),
                Role.ROLE_SELLER
        ));
    }

    private Product createProduct(SellerProfile seller, Category category, String name, String slug,
                                  String sku, String shortDesc, String fullDesc, BigDecimal regularPrice,
                                  BigDecimal salePrice, int stock, String materials,
                                  String origin, String claims, List<String> imageUrls) {
        Product p = new Product(
                seller, category, name, slug, sku, shortDesc, fullDesc,
                regularPrice, salePrice, stock, materials, origin, claims
        );
        p.setProductStatus(ProductStatus.PUBLISHED);
        p.setApprovalStatus(ProductApprovalStatus.APPROVED);

        if (imageUrls != null) {
            for (int i = 0; i < imageUrls.size(); i++) {
                p.addImage(new ProductImage(imageUrls.get(i), name, i, i == 0));
            }
        }
        return productRepository.save(p);
    }
}
