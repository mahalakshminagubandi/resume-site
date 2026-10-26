export const profile = {
  name: "Dr. Mahalakshmi Nagubandi",
  short: "Dr. Mahalakshmi",
  location: "Hyderabad, India",
  email: "mahalakshmi@possibilliontech.com",
  linkedin: "https://www.linkedin.com/in/mahalakshminagubandi",
  skills: ["Team management", "Customer relationship management", "Vendor management"],
};

export const about = [
  "I trained as a naturopathic doctor at the Gandhi Naturopathic Medical College in Hyderabad. I chose naturopathy over the regular medical route because I wanted to do something for people, and to do it differently.",
  "Medicine runs in my family. My grandfather was a doctor, and I grew up watching the respect people gave him. My father was a businessman, so I also grew up watching how a business runs. I never thought I would become an entrepreneur myself, but the two sides of that upbringing came together in the companies I started with my husband, Ayyappa Nagubandi.",
  "In our companies Ayyappa has been the face of the technology, and I have been the backbone: daily operations, hiring, production, vendors and the books. Yoga and naturopathy taught me patience and perseverance, which turn out to be most of what managing people needs.",
  "Today I am the founder of Neonflake and Meaningful Foods, and the co-founder of Broadcast Wear and Possibillion Technologies. I like beginnings. Something new is exciting, and I am happiest when I am making it.",
];

// "years" is optional. Edit the text here and it updates on the page.
export const ventures = [
  {
    name: "Neonflake",
    role: "Founder",
    years: "",
    text: "Neonflake combines AI, IoT and web engineering to design, build and deploy products, from connected hardware to smart software. It also makes its own: Doneva, an open-source Android automation app powered by cloud AI, and Mayavé, a designer homeware brand of 3D-printed sculptural basins and divine décor.",
    links: [
      { label: "neonflake.com", url: "https://www.neonflake.com" },
      { label: "Doneva", url: "https://doneva.app" },
      { label: "Mayavé", url: "https://mayave.design" },
    ],
  },
  {
    name: "Meaningful Foods",
    role: "Founder",
    years: "2022 to now",
    text: "A kitchen automation and robotics company that brings novelty and technology together.",
    links: [],
  },
  {
    name: "Broadcast Wear",
    role: "Co-founder",
    years: "2016 to now",
    text: "What we describe as the world’s first touch-enabled clothing: LED panels stitched into the garment and powered by a small battery box, so a t-shirt can show what you type on your phone. The range grew to include women’s and kids’ wear and a fitness t-shirt called Sygnal. The company raised about $115,000 on the crowdfunding site Indiegogo. I look after operations, recruitment, production, vendors and the books.",
    links: [],
  },
  {
    name: "Possibillion Technologies",
    role: "Co-founder and COO",
    years: "2015 to 2022",
    text: "A technology company I co-founded with Ayyappa. Among its products was an idli vending machine: order on a seven-inch screen, pay by UPI, and a plate of idlis arrives in under a minute with chutney and sambar. The company called it the first of its kind in the world. A team of 30 reported to me.",
    links: [],
  },
];

export const press = {
  video: {
    src: "/press/idli-vending-machine.mp4",
    poster: "/press/idli-vending-machine-poster.jpg",
    outlet: "The Better India",
    title: "This idli vending machine is wowing netizens",
    note: "A short video on the idli vending machine built at Possibillion Technologies.",
  },
  clipping: {
    src: "/press/doctor-who-loves-technology.png",
    alt: "Newspaper clipping titled A doctor who loves technology, showing Mahalakshmi Nagubandi and Ayyappa Nagubandi with Broadcast Wear touch-enabled t-shirts.",
    title: "A doctor who loves technology",
    note: "A newspaper feature on my work at Broadcast Wear. Select the image to open it full size.",
  },
  articles: [
    {
      outlet: "The Indian Express",
      title: "Like instant coffee, instant idli is also possible now",
      summary:
        "Ayyappa Nagubandi and I explain the idea of automating food, and why idli is such a good dish to start with.",
      url: "https://indianexpress.com/article/lifestyle/food-wine/instant-coffee-instant-idli-possible-idli-machine-ayyappa-nagubandi-dr-mahalakshmi-nagubandi-south-indian-food-6045459/",
    },
    {
      outlet: "The Economic Times",
      title: "Smart apparel: This digital t-shirt allows you to customize slogans, image using your smartphone",
      summary:
        "Broadcast Wear, based in Hyderabad, wants to change wearable tech by taking out the extra accessories and building the technology into the clothes.",
      url: "https://economictimes.indiatimes.com/small-biz/startups/features/smart-apparel-this-digital-t-shirt-allows-you-to-customize-slogans-image-using-your-smartphone-broadcastwear/articleshow/61859600.cms?from=mdr",
    },
  ],
};

// Newest first. "end: null" means the role is current.
export const experience = [
  { company: "Meaningful Foods LLP", role: "Founder", start: "Dec 2022", end: null, place: "Hyderabad",
    text: "A kitchen automation and robotics company that brings together novelty and technology." },
  { company: "Broadcast Wearables Pvt Ltd", role: "Co-Founder", start: "Feb 2016", end: null, place: "Hyderabad",
    text: "We created the world’s first touch-enabled clothing. Beyond daily operations, I manage the whole outfit, recruitment and production. I also handle client services, vendor management and the books." },
  { company: "Possibillion Technologies", role: "Co-Founder and COO", start: "Apr 2017", end: "Jan 2022", place: "Hyderabad",
    text: "Generated ideas for new products while keeping the current business running smoothly. A team of 30 people reported to me." },
  { company: "Possibillion Technologies", role: "Senior Operations Manager", start: "Feb 2016", end: "Mar 2017", place: "Hyderabad",
    text: "Looked after day-to-day operations and supervised the managers of Human Resources, Marketing, Finance and Accounting, and Client Services." },
  { company: "Ideative Digital Pvt Ltd", role: "Founder", start: "Jan 2014", end: "May 2016", place: "Hyderabad",
    text: "Ran the company, including finances, drawing up contracts, and keeping the staff engaged with motivational activities." },
  { company: "Possibillion Technologies", role: "Operations Manager", start: "Apr 2015", end: "Jan 2016", place: "Hyderabad",
    text: "Kept the company’s daily activities running without interruption, and made the hiring decisions." },
  { company: "GapBridge Software Services Pvt. Ltd.", role: "Human Resources Manager", start: "2009", end: "2011", place: "Hyderabad",
    text: "Managed staff, recruitment and interviews, attendance, salaries and reimbursements, leave, training sessions, and travel and lodging." },
  { company: "Apollo Health Street Ltd.", role: "Medical Coder / Biller", start: "2006", end: "2008", place: "Hyderabad",
    text: "Identified the root causes of problems and found solutions. Coded the details of diseases so patients could be billed." },
];

export const education = [
  { school: "Gandhi Naturopathic Medical College, Hyderabad", degree: "BNYS, Naturopathic Medicine", years: "2000 – 2006" },
  { school: "SKBR College, Amalapuram", degree: "B.Sc. in Botany, Zoology and Chemistry", years: "1996 – 1999" },
  { school: "SKBR College, Amalapuram", degree: "Intermediate, Science", years: "1994 – 1996" },
  { school: "Paramjyothi Public School, Amalapuram", degree: "10th, ICSE", years: "1994" },
];
