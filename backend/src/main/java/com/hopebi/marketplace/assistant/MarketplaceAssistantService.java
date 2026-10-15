package com.hopebi.marketplace.assistant;

import com.hopebi.marketplace.assistant.dto.MarketplaceQueryRequest;
import com.hopebi.marketplace.assistant.dto.MarketplaceQueryResponse;
import com.hopebi.marketplace.order.Order;
import com.hopebi.marketplace.order.OrderRepository;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.product.ProductStatus;
import com.hopebi.marketplace.product.dto.ProductDto;
import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerRepository;
import com.hopebi.marketplace.seller.dto.SellerPublicDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MarketplaceAssistantService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final OrderRepository orderRepository;

    private static final Pattern ORDER_NUMBER_PATTERN = Pattern.compile("HOP-\\d{8}-[A-Z0-9]+", Pattern.CASE_INSENSITIVE);

    public MarketplaceAssistantService(ProductRepository productRepository,
                                       SellerRepository sellerRepository,
                                       OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
        this.orderRepository = orderRepository;
    }

    public MarketplaceQueryResponse answerQuery(MarketplaceQueryRequest request) {
        String query = request.getQuery().trim();
        String lower = query.toLowerCase();

        MarketplaceQueryResponse response = new MarketplaceQueryResponse();
        response.setQuery(query);

        // 0. Greeting & personalized assistant welcome
        if (lower.matches("^(hi|hello|hey|namaste|vanakkam|good morning|good afternoon|good evening|pranam)[!.,?\\s]*.*")) {
            String name = (request.getUserName() != null && !request.getUserName().trim().isEmpty())
                    ? request.getUserName().trim()
                    : "Shopper";
            response.setTopic("GREETING");
            response.setAnswer(String.format(
                    "### Namaste, %s! 🙏\n\n" +
                    "Welcome to **HOPEBI** — your direct window to authentic Indian craft clusters and underexposed manufacturers.\n\n" +
                    "How can I assist you today? You can ask me:\n" +
                    "- To help find authentic crafts (e.g., *Ayurvedic Kansa tableware*, *Moradabad brass*, *Nilgiri winter flush tea*)\n" +
                    "- To track an existing order (e.g., *track HOP-20261014-XXXXXX*)\n" +
                    "- About our 7-day return policy and free shipping thresholds\n" +
                    "- Information about our verified regional artisan clusters",
                    name
            ));
            response.setSuggestedQueries(List.of(
                    "Show me authentic Ayurvedic Kansa items",
                    "How does 7-day hassle-free return work?",
                    "What makes Moradabad brass unique?",
                    "Where do your products ship from?"
            ));
            return response;
        }

        // 1. Check for specific Order Number lookup (e.g., HOP-20261014-128612)
        Matcher orderMatcher = ORDER_NUMBER_PATTERN.matcher(query);
        if (orderMatcher.find()) {
            String orderNum = orderMatcher.group().toUpperCase();
            Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNum);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                response.setTopic("ORDER_TRACKING");
                response.setAnswer(String.format(
                        "### Order Status for **%s**\n\n" +
                        "- **Current Status:** `%s`\n" +
                        "- **Payment Status:** `%s` (Method: %s)\n" +
                        "- **Total Amount:** ₹%s\n" +
                        "- **Items Ordered:** %d item(s)\n\n" +
                        "Orders are prepared and packed directly by our verified regional manufacturers. Once dispatched, full tracking details will be updated here and sent via SMS/Email.",
                        order.getOrderNumber(),
                        order.getOrderStatus(),
                        order.getPaymentStatus(),
                        order.getPaymentMethod(),
                        order.getTotalAmount().toPlainString(),
                        order.getItems().size()
                ));
                response.setSuggestedQueries(List.of(
                        "What is the return policy if my order is damaged?",
                        "How long does standard delivery take?",
                        "Show me popular products on HOPEBI"
                ));
                return response;
            }
        }

        // 2. Shipping & Delivery Policies
        if (containsAny(lower, "shipping", "delivery", "courier", "delhivery", "free shipping", "dispatch", "how many days", "transit")) {
            response.setTopic("POLICY");
            response.setAnswer(
                    "### HOPEBI Shipping & Delivery Policy\n\n" +
                    "- **Free Pan-India Delivery:** Orders totaling **₹999 or more** qualify for free shipping nationwide. Standard delivery of ₹99 applies for smaller carts.\n" +
                    "- **Maker-Direct Dispatch:** Every item is carefully inspected and packaged directly by our verified Indian manufacturers within **2 to 4 business days**.\n" +
                    "- **Estimated Transit:** Orders arrive in **4 to 7 business days** across tier-1, tier-2, and tier-3 Indian cities.\n" +
                    "- **Logistics Partners:** We partner with trusted courier networks including Delhivery, BlueDart, DTDC, and India Post Speed Post."
            );
            response.setSuggestedQueries(List.of(
                    "What is your return policy?",
                    "What payment methods are supported?",
                    "Show me authentic brassware from Moradabad"
            ));
            return response;
        }

        // 3. Returns & Refunds Policy
        if (containsAny(lower, "return", "refund", "cancellation", "cancel", "damaged", "defective", "broken")) {
            response.setTopic("POLICY");
            response.setAnswer(
                    "### HOPEBI Returns & Refund Guarantee\n\n" +
                    "- **7-Day Return Window:** You can request a return within **7 days of delivery** if the item arrives damaged, has a manufacturing defect, or differs from the catalog description.\n" +
                    "- **Simple 1-Click Process:** Go to your **Orders** tab, select the delivered order, and click **Request Return** with a brief reason.\n" +
                    "- **Instant Refunds:** Once the returned item is collected or verified, refunds are released back to your original payment method (UPI / Bank Account) within **3 to 5 business days**."
            );
            response.setSuggestedQueries(List.of(
                    "How do I track an existing order?",
                    "Are the products authentic and certified?",
                    "Browse all regional categories"
            ));
            return response;
        }

        // 4. Commission & Marketplace Business Model
        if (containsAny(lower, "commission", "platform fee", "margin", "business model", "percentage cut")) {
            response.setTopic("POLICY");
            response.setAnswer(
                    "### HOPEBI Business & Commission Model\n\n" +
                    "- **Fair Maker Economics:** HOPEBI operates on a transparent, configurable baseline platform commission defaulting to **5.0%**.\n" +
                    "- **Direct-to-Consumer Advantage:** By eliminating layers of traditional wholesale distributors and export middlemen, Indian manufacturers retain up to **95% of revenues** while offering honest prices to retail consumers.\n" +
                    "- **No Upfront Listing Fees:** Onboarding and catalog listing are completely free for approved manufacturers."
            );
            response.setSuggestedQueries(List.of(
                    "How can a manufacturer apply to sell on HOPEBI?",
                    "Show me the top regional sellers",
                    "What are the best-selling artisanal products?"
            ));
            return response;
        }

        // 5. Seller Onboarding / Manufacturer Application
        if (containsAny(lower, "become a seller", "sell on hopebi", "manufacturer registration", "onboard", "apply as a seller", "how to sell")) {
            response.setTopic("SELLER_INQUIRY");
            response.setAnswer(
                    "### Become a Seller on HOPEBI\n\n" +
                    "Are you an Indian manufacturer, artisan guild, or differentiated regional brand?\n\n" +
                    "1. **Apply Online:** Visit our [Seller Application Page](/seller-apply) and submit your company profile, state of operation, and GSTIN / Udyam registration.\n" +
                    "2. **Quality Verification:** Our onboarding team reviews your craftsmanship, origin claims, and factory capabilities within 24–48 hours.\n" +
                    "3. **Direct Dashboard:** Once approved, manage your product listings, upload photos from your device, and fulfill customer orders with automated logistics label support."
            );
            response.setSuggestedQueries(List.of(
                    "What commission does HOPEBI charge sellers?",
                    "Can sellers upload photos from mobile phones?",
                    "Browse existing manufacturer stories"
            ));
            return response;
        }

        // 6. Payment Methods & UPI
        if (containsAny(lower, "payment", "upi", "google pay", "phonepe", "paytm", "cod", "cash on delivery", "card", "net banking")) {
            response.setTopic("POLICY");
            response.setAnswer(
                    "### Supported Payment Options\n\n" +
                    "- **Unified Payments Interface (UPI):** Instant, secure checkouts via Google Pay, PhonePe, Paytm, CRED, and BHIM.\n" +
                    "- **Cards:** All Indian Debit and Credit Cards (RuPay, Visa, MasterCard).\n" +
                    "- **Net Banking:** Supported across 50+ major Indian banks (SBI, HDFC, ICICI, Axis, PNB).\n" +
                    "- **Cash on Delivery (COD):** Available for selected postal PIN codes across India."
            );
            response.setSuggestedQueries(List.of(
                    "Is online payment safe on HOPEBI?",
                    "What is the delivery time?",
                    "Explore authentic Kansa dinnerware"
            ));
            return response;
        }

        // 7. Craft Traditions & Regional Product Knowledge Retrieval (RAG)
        Map<String, String> craftKnowledge = getCraftKnowledgeMap();
        for (Map.Entry<String, String> entry : craftKnowledge.entrySet()) {
            if (lower.contains(entry.getKey())) {
                response.setTopic("CRAFT_KNOWLEDGE");
                response.setAnswer(entry.getValue());
                attachMatchingProducts(response, entry.getKey());
                attachMatchingSellers(response, entry.getKey());
                response.setSuggestedQueries(List.of(
                        "What is the price and stock availability?",
                        "What are the care and cleaning instructions?",
                        "Show me more items from this manufacturer"
                ));
                return response;
            }
        }

        // 8. General Product & Catalogue Keyword Search
        List<Product> matchedProducts = productRepository.findPublicProductsWithFilters(null, null, null, query, PageRequest.of(0, 4)).getContent();
        if (!matchedProducts.isEmpty()) {
            response.setTopic("PRODUCT_INQUIRY");
            response.setRelevantProducts(matchedProducts.stream().map(ProductDto::new).collect(Collectors.toList()));
            response.setAnswer(String.format(
                    "### Found %d Curated Item(s) on HOPEBI matching \"%s\":\n\n" +
                    "Here are authentic products handcrafted by our verified regional manufacturers. Each product is sourced directly from its traditional craft cluster with transparent pricing.",
                    matchedProducts.size(),
                    query
            ));
            response.setSuggestedQueries(List.of(
                    "What are the dimensions and materials?",
                    "Is free delivery available for this order?",
                    "Tell me about the manufacturer of this product"
            ));
            return response;
        }

        // 9. Seller / Manufacturer Name Search
        List<SellerProfile> matchedSellers = sellerRepository.findAll().stream()
                .filter(s -> s.getCompanyName().toLowerCase().contains(lower) || s.getState().toLowerCase().contains(lower))
                .limit(3)
                .collect(Collectors.toList());

        if (!matchedSellers.isEmpty()) {
            response.setTopic("SELLER_INQUIRY");
            response.setRelevantSellers(matchedSellers.stream().map(SellerPublicDto::new).collect(Collectors.toList()));
            response.setAnswer(String.format(
                    "### Verified Regional Manufacturers matching \"%s\":\n\n" +
                    "These verified Indian companies manufacture genuine products in their regional workshops:",
                    query
            ));
            response.setSuggestedQueries(List.of(
                    "Show all products from this maker",
                    "How does HOPEBI verify its manufacturers?",
                    "What are the shipping charges?"
            ));
            return response;
        }

        // 10. Strict Boundary & Guardrail for Off-Topic Questions
        if (isOffTopic(lower)) {
            response.setGrounded(false);
            response.setTopic("OFF_TOPIC");
            response.setAnswer(
                    "**Namaste!** I am the dedicated **HOPEBI Marketplace Assistant**.\n\n" +
                    "My knowledge is focused exclusively on **HOPEBI**—connecting you with vetted regional Indian manufacturers, authentic craft products, shipping & returns policies, order tracking, and seller onboarding.\n\n" +
                    "I cannot assist with unrelated general queries, but I would love to help you discover unique Indian craftsmanship! How can I assist you with your shopping or manufacturer journey on HOPEBI?"
            );
            response.setSuggestedQueries(List.of(
                    "Show me authentic Kansa bronze dinnerware",
                    "What is your Pan-India shipping policy?",
                    "Tell me about Moradabad brass handicrafts",
                    "How do manufacturers apply to sell on HOPEBI?"
            ));
            return response;
        }

        // Fallback site-grounded response
        response.setTopic("GENERAL_SITE");
        response.setAnswer(
                "### Exploring HOPEBI — Curated Indian B2C Marketplace\n\n" +
                "HOPEBI brings underexposed Indian manufacturers and master craft clusters directly to retail consumers.\n\n" +
                "- **Authentic Regional Crafts:** Bell metal Kansa from Gujarat, hand-etched Moradabad brassware, single-estate Nilgiri teas, Kashmir Pashmina, Channapatna woodcraft, and Khurja ceramics.\n" +
                "- **Free Delivery:** Free delivery across India on orders over ₹999.\n" +
                "- **Buyer Protection:** 7-day return guarantee with direct maker fulfillment.\n\n" +
                "Try searching for specific craft traditions, product types, or your order tracking number!"
        );
        response.setSuggestedQueries(List.of(
                "Show me popular products",
                "How can I track my order?",
                "What is the return policy?",
                "Become an approved seller"
        ));
        return response;
    }

    private boolean containsAny(String input, String... keywords) {
        for (String kw : keywords) {
            if (input.contains(kw)) return true;
        }
        return false;
    }

    private boolean isOffTopic(String query) {
        String[] offTopicIndicators = {
                "weather", "capital of", "who is", "president", "movie", "song", "python code", "write a code",
                "recipe for", "football", "cricket score", "stock market", "cryptocurrency", "bitcoin",
                "chatgpt", "translate into", "joke", "poem"
        };
        for (String word : offTopicIndicators) {
            if (query.contains(word)) return true;
        }
        return false;
    }

    private void attachMatchingProducts(MarketplaceQueryResponse response, String keyword) {
        List<Product> products = productRepository.findPublicProductsWithFilters(null, null, null, keyword, PageRequest.of(0, 3)).getContent();
        if (!products.isEmpty()) {
            response.setRelevantProducts(products.stream().map(ProductDto::new).collect(Collectors.toList()));
        }
    }

    private void attachMatchingSellers(MarketplaceQueryResponse response, String keyword) {
        List<SellerProfile> sellers = sellerRepository.findAll().stream()
                .filter(s -> (s.getCompanyName() != null && s.getCompanyName().toLowerCase().contains(keyword)) ||
                             (s.getCompanyDescription() != null && s.getCompanyDescription().toLowerCase().contains(keyword)) ||
                             (s.getManufacturerHeritage() != null && s.getManufacturerHeritage().toLowerCase().contains(keyword)) ||
                             (s.getState() != null && s.getState().toLowerCase().contains(keyword)))
                .limit(2)
                .collect(Collectors.toList());
        if (!sellers.isEmpty()) {
            response.setRelevantSellers(sellers.stream().map(SellerPublicDto::new).collect(Collectors.toList()));
        }
    }

    private Map<String, String> getCraftKnowledgeMap() {
        Map<String, String> map = new LinkedHashMap<>();

        map.put("kansa",
                "### Kutch & Gujarat Bell Metal (Kansa) Craft\n\n" +
                "**Kansa** is a sacred alloy composed of **78% pure Copper and 22% Tin** (certified bell metal ratio). " +
                "Recognized in ancient Ayurvedic texts as *Kansyam*, eating from Kansa dinnerware is traditionally believed to balance *Vata, Pitta, and Kapha* doshas. " +
                "Our Kansa artisans in Gujarat hand-forge each piece using traditional hot-hammering techniques without lead or synthetic coatings.\n\n" +
                "- **Care Instructions:** Hand wash with mild soap and lime/tamarind paste. Avoid harsh abrasives or dishwashers."
        );

        map.put("brass",
                "### Moradabad Hand-Etched Brassware (Peetal Nagri)\n\n" +
                "Moradabad in Uttar Pradesh has been the global epicenter of brass casting and engraving since the Mughal era. " +
                "Our registered artisans produce heavy-gauge solid brass Urlis, planters, and decorative lamps using traditional sand-casting followed by *Naqqashi* (delicate hand-chiseling) and natural oxidation finishing.\n\n" +
                "- **Care Instructions:** Clean with Pitambari powder or lemon juice and wipe dry with a microfiber cloth."
        );

        map.put("tea",
                "### Nilgiri Artisanal Whole Leaf Teas\n\n" +
                "Grown at elevations exceeding 6,500 feet in the Western Ghats of Tamil Nadu, high-grown **Nilgiri Frost Teas** are celebrated for their bright golden liquor, natural floral bouquet, and zero bitterness. " +
                "Unlike mass-market blended CTC tea dust, our single-estate teas feature orthodox whole-leaf hand-plucking from morning mists.\n\n" +
                "- **Brewing Note:** Steep 2.5g in water at 90°C for 3–4 minutes for an exquisite afternoon cup."
        );

        map.put("pashmina",
                "### Kashmir Handwoven Pashmina & GI Weaving\n\n" +
                "Authentic Kashmiri Pashmina is spun from the ultra-fine underfleece of Himalayan *Capra Hircus* goats (fiber diameter below 15 microns). " +
                "Hand-spun on traditional *Charkhas* and handwoven on pit looms in Srinagar, each shawl represents over 180 artisan-hours of craftsmanship and bears GI-traceable origin marks.\n\n" +
                "- **Care Instructions:** Dry clean only. Store wrapped in pure muslin cloth with natural cedar balls."
        );

        map.put("channapatna",
                "### Channapatna Wooden Toys & Craft (Gombegala Ooru)\n\n" +
                "Hailing from Ramanagara district near Bengaluru, Channapatna craft uses seasoned Ivory Wood (*Wrightia tinctoria*) turned on hand-lathes. " +
                "It is lacquered entirely with natural vegetable dyes extracted from turmeric, indigo, and katha—making them 100% non-toxic, eco-friendly, and safe for infants and young children."
        );

        map.put("khurja",
                "### Khurja High-Fired Ceramic Stoneware\n\n" +
                "Known as the 'Ceramic Town of India', Khurja pottery in Uttar Pradesh dates back over 500 years. " +
                "Pieces are vitrified at 1250°C, rendering them lead-free, non-porous, microwave-safe, and dishwasher-friendly for everyday dining."
        );

        map.put("pepper",
                "### Tellicherry Garbled Extra Bold (TGEB) Black Pepper\n\n" +
                "Harvested in the lush hills of Malabar, Kerala, TGEB pepper is recognized worldwide as the highest grade of black pepper. " +
                "Only berries measuring 4.25mm or larger are selected, sun-dried, and packed unadulterated with exceptional piperine and essential oil content."
        );

        map.put("kolhapuri",
                "### Hand-Braided Kolhapuri Leather Footwear\n\n" +
                "Handcrafted in Maharashtra using 100% vegetable-tanned buffalo leather, authentic Kolhapuris feature zero chemical chrome tanning. " +
                "Stitched with natural sisal fiber cord, they mold comfortably to the wearer's feet over time.\n\n" +
                "- **Care Tip:** Occasionally rub with castor or coconut oil to maintain suppleness and water resistance."
        );

        map.put("pottery",
                "### Jaipur Traditional Blue Pottery\n\n" +
                "Unlike conventional pottery, Jaipur Blue Pottery uses no clay. It is crafted from a unique paste of Egyptian quartz powder, Fuller's earth, and natural gum, fired at low temperatures and adorned with classical Persian cobalt blue motifs."
        );

        return map;
    }
}
