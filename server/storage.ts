import { type Webpage, type InsertWebpage, type SearchResult, type InsertSearchQuery } from "@shared/schema";

export interface IStorage {
  // Webpage operations
  getWebpage(id: number): Promise<Webpage | undefined>;
  getWebpageByUrl(url: string): Promise<Webpage | undefined>;
  getWebpages(): Promise<Webpage[]>;
  createWebpage(webpage: InsertWebpage): Promise<Webpage>;
  
  // Search operations
  searchWebpages(query: string): Promise<SearchResult[]>;
  recordSearchQuery(query: string, resultsCount: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private webpages: Map<number, Webpage>;
  private searchLogs: Map<number, InsertSearchQuery>;
  private currentWebpageId: number;
  private currentSearchLogId: number;

  constructor() {
    this.webpages = new Map();
    this.searchLogs = new Map();
    this.currentWebpageId = 1;
    this.currentSearchLogId = 1;
    this.seedData();
  }

  async getWebpage(id: number): Promise<Webpage | undefined> {
    return this.webpages.get(id);
  }

  async getWebpageByUrl(url: string): Promise<Webpage | undefined> {
    return Array.from(this.webpages.values()).find(
      (webpage) => webpage.url === url
    );
  }

  async getWebpages(): Promise<Webpage[]> {
    return Array.from(this.webpages.values());
  }

  async createWebpage(insertWebpage: InsertWebpage): Promise<Webpage> {
    const id = this.currentWebpageId++;
    const now = new Date();
    const webpage: Webpage = { ...insertWebpage, id, lastIndexed: now };
    this.webpages.set(id, webpage);
    return webpage;
  }

  async searchWebpages(query: string): Promise<SearchResult[]> {
    // Simple search algorithm based on keyword matching
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);
    
    const results: SearchResult[] = [];
    
    for (const webpage of this.webpages.values()) {
      const titleLower = webpage.title.toLowerCase();
      const descriptionLower = webpage.description.toLowerCase();
      const contentLower = webpage.content.toLowerCase();
      
      // Calculate relevance score based on matches in title, description, content
      let relevanceScore = 0;
      let matchingTerms = 0;

      // Find snippet with context
      let snippet = webpage.description;
      
      for (const term of queryTerms) {
        // Title matches are weighted highest
        if (titleLower.includes(term)) {
          relevanceScore += 10;
          matchingTerms++;
        }
        
        // Description matches are weighted second
        if (descriptionLower.includes(term)) {
          relevanceScore += 5;
          matchingTerms++;
        }
        
        // Content matches
        if (contentLower.includes(term)) {
          relevanceScore += 3;
          matchingTerms++;
          
          // Try to find the term in context for the snippet
          const termIndex = contentLower.indexOf(term);
          if (termIndex > -1) {
            const start = Math.max(0, termIndex - 50);
            const end = Math.min(contentLower.length, termIndex + term.length + 50);
            snippet = "..." + webpage.content.substring(start, end) + "...";
          }
        }
      }
      
      // Only include results that match at least one term
      if (matchingTerms > 0) {
        // Bonus for matching all terms
        if (matchingTerms === queryTerms.length) {
          relevanceScore += 5;
        }
        
        results.push({
          id: webpage.id,
          url: webpage.url,
          title: webpage.title,
          description: webpage.description,
          snippet,
          relevanceScore
        });
      }
    }
    
    // Sort by relevance score (descending)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  async recordSearchQuery(query: string, resultsCount: number): Promise<void> {
    const id = this.currentSearchLogId++;
    this.searchLogs.set(id, { query, resultsCount });
  }

  private seedData() {
    // Seed with some initial webpage data for Rajasthan tourism (from design reference)
    const initialData: InsertWebpage[] = [
      {
        url: "https://tourism.rajasthan.gov.in/home",
        title: "राजस्थान पर्यटन - प्रामाणिक राजस्थान",
        description: "राजस्थान, भारत के सबसे बड़े राज्यों में से एक है, जो अपने महलों, किलों और रंगीन संस्कृति के लिए प्रसिद्ध है।",
        content: "राजस्थान, भारत के सबसे बड़े राज्यों में से एक है, जो अपने महलों, किलों और रंगीन संस्कृति के लिए प्रसिद्ध है। यहां के प्रमुख स्थल जैसलमेर, जयपुर, उदयपुर, जोधपुर, और पुष्कर हैं। राजस्थान के ललित कलाओं, परंपराओं, त्योहारों, रीति-रिवाजों, व्यंजनों और स्वागत की भावना भारत भर के लोगों को आकर्षित करती है। प्रामाणिक राजस्थानी अनुभव के लिए, आपको यहां की गर्मी, रंगीली संस्कृति और विशाल रेगिस्तान के दृश्य का आनंद लेना चाहिए।"
      },
      {
        url: "https://www.rajasthantourism.gov.in/destinations",
        title: "राजस्थान के टॉप 10 पर्यटन स्थल | राजस्थान टूरिज्म",
        description: "राजस्थान के सबसे लोकप्रिय और खूबसूरत पर्यटन स्थल। अपनी यात्रा की योजना बनाएं और राजस्थान के रंग में रंग जाएं।",
        content: "राजस्थान के सबसे लोकप्रिय और खूबसूरत पर्यटन स्थल। अपनी यात्रा की योजना बनाएं और राजस्थान के रंग में रंग जाएं। पिंक सिटी जयपुर, ब्लू सिटी जोधपुर, और गोल्डन सिटी जैसलमेर की यात्रा करें। राजस्थान के टॉप 10 पर्यटन स्थल: 1. जयपुर - हवा महल, आमेर फोर्ट, सिटी पैलेस। 2. उदयपुर - सिटी पैलेस, पिछोला झील, फतेहसागर झील। 3. जोधपुर - मेहरानगढ़ किला, उम्मेद भवन पैलेस। 4. जैसलमेर - जैसलमेर फोर्ट, पटवों की हवेली। 5. पुष्कर - ब्रह्मा मंदिर, पुष्कर झील। 6. बीकानेर - जूनागढ़ फोर्ट, कर्णी माता मंदिर। 7. माउंट आबू - दिलवाड़ा मंदिर, नक्की झील। 8. रणथंभौर - टाइगर रिजर्व, रणथंभौर फोर्ट। 9. चित्तौड़गढ़ - चित्तौड़गढ़ फोर्ट, विजय स्तंभ। 10. अजमेर - अजमेर शरीफ दरगाह, अना सागर झील।"
      },
      {
        url: "https://www.rajasthan-tourism.org/top-destinations",
        title: "राजस्थान के प्रमुख पर्यटन स्थल",
        description: "राजस्थान के प्रमुख पर्यटन स्थलों की जानकारी, जिनमें जयपुर, उदयपुर, जोधपुर और जैसलमेर शामिल हैं।",
        content: "राजस्थान के प्रमुख पर्यटन स्थल: जयपुर - पिंक सिटी (हवा महल, जल महल, आमेर किला), उदयपुर - झीलों का शहर (सिटी पैलेस, पिछोला झील, फतेहसागर झील), जोधपुर - ब्लू सिटी (मेहरानगढ़ किला, उम्मेद भवन पैलेस), जैसलमेर - गोल्डन सिटी (जैसलमेर किला, पटवों की हवेली, सम सैंड ड्यून्स)। इन प्रसिद्ध स्थलों के अलावा, बीकानेर, पुष्कर, अलवर, भरतपुर, और माउंट आबू भी राजस्थान के महत्वपूर्ण पर्यटन स्थल हैं। राजस्थान की सांस्कृतिक विरासत, ऐतिहासिक महत्व और प्राकृतिक सुंदरता इसे भारत का एक अद्वितीय पर्यटन स्थल बनाते हैं।"
      },
      {
        url: "https://yatra.com/rajasthan-tourism",
        title: "राजस्थान टूर पैकेज | राजस्थान यात्रा योजना",
        description: "राजस्थान के लिए विशेष टूर पैकेज - जयपुर, उदयपुर, जोधपुर, जैसलमेर, पुष्कर, बीकानेर, माउंट आबू और अजमेर।",
        content: "राजस्थान के लिए विशेष टूर पैकेज - जयपुर, उदयपुर, जोधपुर, जैसलमेर, पुष्कर, बीकानेर, माउंट आबू और अजमेर। हम रेगिस्तान सफारी, महल यात्रा, और सांस्कृतिक अनुभव प्रदान करते हैं। हमारे टूर पैकेज में राजस्थान के विभिन्न प्रमुख पर्यटन स्थलों की यात्रा शामिल है, जैसे जयपुर में हवा महल, आमेर फोर्ट और जंतर मंतर; उदयपुर में सिटी पैलेस और लेक पैलेस; जोधपुर में मेहरानगढ़ फोर्ट और उम्मेद भवन; जैसलमेर में जैसलमेर फोर्ट और रेत के टीले। हमारे पैकेज सभी बजट और समय सीमाओं के लिए उपलब्ध हैं, चाहे आप एक सप्ताहांत की यात्रा या 15 दिन का विस्तृत दौरा कर रहे हों। पारिवारिक छुट्टियां, हनीमून पैकेज, या दोस्तों के साथ यात्रा - हम सभी के लिए अनुकूलित अनुभव प्रदान करते हैं।"
      },
      {
        url: "https://incredibleindia.org/rajasthan",
        title: "राजस्थान - शाही राज्य | अतुल्य भारत",
        description: "राजस्थान का इतिहास, संस्कृति और परंपरा का अनुभव करें। राजस्थान, भारत का सबसे रंगीन और विविध राज्य है।",
        content: "राजस्थान का इतिहास, संस्कृति और परंपरा का अनुभव करें। राजस्थान, भारत का सबसे रंगीन और विविध राज्य है, जहां आपको रॉयल हेरिटेज, फोर्ट्स, और महलों का अनोखा संगम देखने को मिलता है। राजस्थान के महाराजाओं का शाही इतिहास, रेगिस्तानी संस्कृति, और लोक कलाएं इस राज्य को एक अद्भुत पर्यटन स्थल बनाते हैं। पधारो म्हारे देश - राजस्थान में आपका स्वागत है! राजस्थान में पर्यटन के लिए सबसे अच्छा समय अक्टूबर से मार्च के बीच होता है, जब मौसम सुहावना होता है। राजस्थान के हर शहर का अपना अनोखा रंग और पहचान है - जयपुर गुलाबी, जोधपुर नीला, जैसलमेर सुनहरा, और उदयपुर सफेद। विश्व प्रसिद्ध राजस्थानी व्यंजन, जैसे दाल बाटी चूरमा, लाल मांस, और केर संगरी, यहां की यात्रा को और भी यादगार बनाते हैं।"
      },
      {
        url: "https://wikipedia.org/wiki/राजस्थान_पर्यटन",
        title: "राजस्थान पर्यटन - विकिपीडिया",
        description: "राजस्थान भारत का सबसे बड़ा राज्य है, जो अपने ऐतिहासिक महत्व, सांस्कृतिक विरासत और प्राकृतिक सुंदरता के लिए जाना जाता है।",
        content: "राजस्थान भारत का सबसे बड़ा राज्य है, जो अपने ऐतिहासिक महत्व, सांस्कृतिक विरासत और प्राकृतिक सुंदरता के लिए जाना जाता है। राजस्थान के प्रमुख पर्यटन स्थलों में जयपुर, उदयपुर, जोधपुर, जैसलमेर, पुष्कर, बीकानेर, माउंट आबू, रणथंभौर, और चित्तौड़गढ़ शामिल हैं। राजस्थान का क्षेत्रफल 342,239 वर्ग किलोमीटर है, जो भारत के कुल क्षेत्रफल का लगभग 10.4% है। राज्य की पश्चिमी सीमा पर पाकिस्तान स्थित है। थार रेगिस्तान राज्य के पश्चिमी और उत्तर-पश्चिमी भाग में स्थित है। राजस्थान के मुख्य आकर्षणों में महल और किले, झीलें, मंदिर, रेगिस्तान सफारी, ऊंट की सवारी, और लोक नृत्य और संगीत शामिल हैं। राजस्थान के प्रमुख त्योहारों में पुष्कर मेला, मरु महोत्सव, नागौर मेला, और तेज दशमी शामिल हैं। राजस्थान की अर्थव्यवस्था में पर्यटन एक महत्वपूर्ण भूमिका निभाता है, और राज्य हर साल लाखों घरेलू और अंतरराष्ट्रीय पर्यटकों को आकर्षित करता है।"
      },
      {
        url: "https://thrillophilia.com/rajasthan-attractions",
        title: "राजस्थान की रोमांचक यात्रा | थ्रिलोफिलिया",
        description: "राजस्थान के सबसे रोमांचक और रहस्यमयी स्थलों की यात्रा करें। भूत महल, हवेलियां, और रेगिस्तान के अनछुए पहलू।",
        content: "राजस्थान के सबसे रोमांचक और रहस्यमयी स्थलों की यात्रा करें। भूत महल, हवेलियां, और रेगिस्तान के अनछुए पहलू। राजस्थान में साहसिक गतिविधियों की एक विस्तृत श्रृंखला है, जिसमें जिप-लाइनिंग, हॉट एयर बैलून सफारी, रेगिस्तान में कैम्पिंग, जीप सफारी, और ऊंट की सवारी शामिल हैं। भानगढ़ का भूतिया किला, जो भारत के सबसे डरावने स्थानों में से एक माना जाता है, राजस्थान में स्थित है। यहां कांटे सकल और भैरव मंदिर जैसे रहस्यमयी स्थल भी हैं। राजस्थान राजपूत वीरों की भूमि है, जिन्होंने अपने साहस और बलिदान के लिए इतिहास में अपना नाम अमर कर दिया है। चित्तौड़गढ़ में जौहर स्थल, हल्दीघाटी युद्ध का मैदान, और जैसलमेर में सोनार किला ऐसे स्थान हैं जहां आप राजपूत इतिहास के साहसिक किस्सों को जान सकते हैं। ट्रेकिंग, रॉक क्लाइम्बिंग, और वाइल्डलाइफ सफारी जैसी एडवेंचर एक्टिविटीज के लिए भी राजस्थान जाना जाता है।"
      },
      {
        url: "https://makemytrip.com/rajasthan-packages",
        title: "राजस्थान होलिडे टूर पैकेज | मेक माई ट्रिप",
        description: "सर्वोत्तम राजस्थान पैकेज। 3 से 10 दिन के टूर अनुभव। प्रीमियम और बजट दोनों विकल्प उपलब्ध हैं।",
        content: "सर्वोत्तम राजस्थान पैकेज। 3 से 10 दिन के टूर अनुभव। प्रीमियम और बजट दोनों विकल्प उपलब्ध हैं। हमारे पैकेज में होटल, परिवहन, स्थानीय गाइड, और भोजन शामिल हैं। राजस्थान के प्रमुख पर्यटन स्थलों जैसे जयपुर, उदयपुर, जोधपुर, जैसलमेर, पुष्कर, बीकानेर, और माउंट आबू के लिए हमारे पास विशेष पैकेज हैं। हम आपके बजट और यात्रा की अवधि के अनुसार अनुकूलित पैकेज भी प्रदान करते हैं। हमारे पैकेज में रेगिस्तान सफारी, राजस्थानी संस्कृति का अनुभव, रॉयल पैलेस डिनर, और फोल्क म्यूजिक परफॉर्मेंस जैसे विशेष अनुभव भी शामिल हैं। हनीमून कपल्स के लिए हमारे पास रोमांटिक राजस्थान पैकेज हैं, जिनमें लेक पैलेस स्टे, प्राइवेट डिनर, और रोमांटिक सनसेट क्रूज शामिल हैं। परिवारों के लिए, हमारे फैमिली फ्रेंडली पैकेज में बच्चों के लिए विशेष गतिविधियां और पारिवारिक कमरे शामिल हैं।"
      },
      {
        url: "https://hotelassociation.rajasthan.gov.in/stays",
        title: "राजस्थान में ठहरने के विकल्प | होटल एसोसिएशन राजस्थान",
        description: "राजस्थान में हेरिटेज होटल, पैलेस स्टे, लक्जरी रिसॉर्ट्स, और बजट होटल की विस्तृत सूची।",
        content: "राजस्थान में ठहरने के विकल्प | होटल एसोसिएशन राजस्थान द्वारा प्रमाणित: हेरिटेज होटल: राजस्थान के हेरिटेज होटल जो पुराने महलों और हवेलियों को होटलों में बदल दिया गया है, जैसे रामबाग पैलेस जयपुर, उम्मेद भवन पैलेस जोधपुर, और लक्ष्मी निवास पैलेस उदयपुर। लक्जरी रिसॉर्ट्स: द ओबेरॉय उदयविलास, द लीला पैलेस जयपुर, और सिक्स सेंसेस फोर्ट बरवारा जैसे विश्व स्तरीय रिसॉर्ट्स। मिड-रेंज होटल्स: मध्यम बजट वाले पर्यटकों के लिए आरामदायक और सुविधाजनक विकल्प। बजट होटल्स और गेस्टहाउसेज: कम खर्च में अच्छी सुविधाएं प्रदान करने वाले होटल। डेजर्ट कैंप्स: जैसलमेर और बीकानेर के रेगिस्तान में लक्जरी और स्टैंडर्ड टेंट कैंप्स। हीरिटेज हवेलियां: परंपरागत राजस्थानी हवेलियों में घरेलू माहौल में ठहरने का अनुभव। राजस्थान होटल एसोसिएशन के सभी सदस्य स्वच्छता, सुरक्षा, और अच्छी सेवा के मानकों का पालन करते हैं। हम अपने सदस्य होटलों की नियमित जांच करते हैं और पर्यटकों को सर्वोत्तम अनुभव प्रदान करने के लिए प्रतिबद्ध हैं।"
      },
      {
        url: "https://tourism.gov.in/festivals-of-rajasthan",
        title: "राजस्थान के प्रमुख उत्सव और त्योहार | टूरिज्म डिपार्टमेंट",
        description: "राजस्थान के रंगारंग उत्सवों और त्योहारों की पूरी जानकारी। पुष्कर मेला, मरु महोत्सव, नागौर मेला, और कई अन्य।",
        content: "राजस्थान के प्रमुख उत्सव और त्योहार: 1. पुष्कर मेला: पुष्कर में कार्तिक पूर्णिमा के अवसर पर हर साल आयोजित होने वाला विश्व प्रसिद्ध ऊंट मेला। 2. मरु महोत्सव: जैसलमेर में फरवरी महीने में आयोजित होने वाला रेगिस्तानी सांस्कृतिक उत्सव। 3. तेज दशमी: जयपुर में आयोजित होने वाला एक महत्वपूर्ण धार्मिक त्योहार। 4. नागौर मेला: नागौर में पशुओं के मेले के लिए प्रसिद्ध। 5. ब्रज होली: भरतपुर क्षेत्र में रंगों का त्योहार जो 15 दिनों तक चलता है। 6. घूमर: राजस्थान का लोक नृत्य जो विभिन्न त्योहारों पर प्रदर्शित किया जाता है। 7. गणगौर: राजस्थान की महिलाओं का प्रमुख त्योहार जो वसंत ऋतु में मनाया जाता है। 8. कुंभलगढ़ महोत्सव: कुंभलगढ़ किले में आयोजित होने वाला सांस्कृतिक उत्सव। 9. उर्स मेला: अजमेर में ख्वाजा मोइनुद्दीन चिश्ती की दरगाह पर आयोजित। 10. वंश धरोहर महोत्सव: जोधपुर में आयोजित होने वाला संगीत और नृत्य उत्सव। 11. शीतला माता मेला: राजस्थान के विभिन्न हिस्सों में आयोजित धार्मिक मेला। इन त्योहारों में राजस्थानी संस्कृति, परंपरा, लोक नृत्य, और संगीत का जीवंत प्रदर्शन देखने को मिलता है। पर्यटकों के लिए ये त्योहार राजस्थान की जीवंत संस्कृति को समझने का सबसे अच्छा अवसर प्रदान करते हैं।"
      }
    ];

    // Insert seed data into storage
    for (const webpage of initialData) {
      this.createWebpage(webpage);
    }
  }
}

export const storage = new MemStorage();
