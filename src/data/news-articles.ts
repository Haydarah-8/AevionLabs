import type { ArticleSection } from "@/lib/blog/types";

export type LegacyArticle = {
  title: string;
  category: string;
  sub: string;
  date: string;
  sections: ArticleSection[];
};

const GUARDIAN_URL =
  "https://www.theguardian.com/environment/2026/mar/20/bentham-north-yorkshire-pfas-toxic-forever-chemicals-blood";

/** Guardian CDN — same assets as #img-1 and #img-2 on the source article */
const GUARDIAN_BENTHAM_IMG_ANGUS =
  "https://i.guim.co.uk/img/media/3d8eefb12a2db6280477f2c2ed5202fc3c3683bd/1120_0_5600_4480/master/5600.jpg?width=1200&quality=85&auto=format&fit=max&s=4d3ad03aedbdcec444c5fd3c32d61c6d";
const GUARDIAN_BENTHAM_IMG_ALLOTMENT =
  "https://i.guim.co.uk/img/media/3fd9432fc20d1cd3d5623571d1bbee37d61a3c9d/838_1068_2923_2051/master/2923.jpg?width=1065&quality=85&auto=format&fit=max&s=55f76b2dfb672d63e3de9a732d7a0b8a";

const WSJ_TOXINS_URL =
  "https://www.wsj.com/articles/food-companies-expect-more-consumers-to-worry-about-toxins-f2910189";

const WSJ_TOXINS_IMG =
  "https://images.wsj.net/im-95738582?width=700&size=1.501";

const WAPO_IRAN_ECON_URL =
  "https://www.washingtonpost.com/world/2026/03/19/iran-war-global-economic-impact/";

const REUTERS_IRAN_OIL_SHIELD_URL =
  "https://www.reuters.com/markets/commodities/trumps-iran-war-oil-shield-is-cracking-2026-03-23/";

const REUTERS_CHINA_MIDDLE_EAST_CYCLE_URL =
  "https://www.reuters.com/world/china/china-warns-vicious-cycle-if-war-escalates-middle-east-2026-03-23/";

const REUTERS_CHINA_MIDDLE_EAST_CYCLE_IMG =
  "https://www.reuters.com/resizer/v2/VHFOR2ESIRNK7LNVS5XFIHT5M4.jpg?auth=dfc4a3c44d032b57ae3d4ed52b56e93ce50a42c1d176c9e31253360e5ad9a179&width=640&quality=80";

const REUTERS_TEHRAN_REFINERY_IMG =
  "https://www.reuters.com/resizer/v2/D7WAZCKMEFHNPBWJPJUVXA5XMM.JPG?auth=cc9f469288817eb6ae7c77c320a1ce3cd9fef49e8b39b4aa08cf19c4e722645c&width=640&quality=80";

const REUTERS_CHART_US_OIL =
  "https://www.reuters.com/graphics/US-OIL/jnvwrxbropw/chart.png";

const REUTERS_CHART_HORMUZ =
  "https://www.reuters.com/graphics/HORMUZ-OIL/znpnmbazmvl/chart.png";

const REUTERS_GULF_ATTACK_MAP =
  "https://fingfx.thomsonreuters.com/gfx/ce/zdvxgnxzkpx/GulfAttackMap.png";

const REUTERS_CENTRAL_BANKS_WAR_URL =
  "https://www.reuters.com/world/americas/fed-boc-strike-hawkish-tones-top-central-banks-convene-wars-shadow-2026-03-18/";

const REUTERS_CB_IMG_POWELL =
  "https://www.reuters.com/resizer/v2/D2F6EUTWPFKQJFSHQ5O6TUHQPQ.jpg?auth=7939396c7c0ad72e7e318baee38aff3a6b50253523ab397e965a4e2883cbb02f&width=960&quality=80";

const REUTERS_CB_IMG_2 =
  "https://www.reuters.com/resizer/v2/T2TABZKJTBIT3AB635ICOOLRAY.jpg?auth=9a8b35526f0df2377575f3e340244d458a788cac7b296dc974df112d68c40168&width=480&quality=80";

const REUTERS_CB_IMG_3 =
  "https://www.reuters.com/resizer/v2/4BYLAR3LMFICDJTQ333C7JE5DI.jpg?auth=9a6b0952b5ebed2a17b035c473bee2e838c1b4d8abbd0e6d6ee6a622451b5b2f&width=960&quality=80";

export const legacyArticles: Record<string, LegacyArticle> = {
  "north-yorkshire-bentham-pfas-blood-testing": {
    title:
      "People in North Yorkshire town found to have ‘alarming’ levels of toxic PFAS in blood",
    category: "Insights",
    sub: "Environment & health",
    date: "03.20.2026",
    sections: [
      {
        type: "paragraph",
        text: "The article below follows the reporting of Martha Elwell and Pippa Neill for The Guardian (20 March 2026). Elijah W Group does not own this journalism; we present it in full for clients tracking environmental risk, public health, and industrial policy.",
      },
      {
        type: "paragraph",
        text: "Exclusive: Testing in Bentham, home to UK’s highest recorded PFAS levels, finds one in four have blood levels in the greatest risk category.",
      },
      {
        type: "figure",
        src: GUARDIAN_BENTHAM_IMG_ANGUS,
        alt: "Exterior of the Angus Fire factory building and signage",
        caption:
          "Angus Fire, a factory in Bentham in North Yorkshire that legally produced PFAS-containing firefighting foam between 1976 and 2024. Photograph: Rob Whitrow / Ends Report (The Guardian).",
      },
      {
        type: "paragraph",
        text: "Alarming levels of toxic forever chemicals have been found in the blood of people living in a town previously revealed to be contaminated with the UK’s highest recorded level of PFAS.",
      },
      {
        type: "paragraph",
        text: "PFAS, short for per- and polyfluoroalkyl substances and commonly known as forever chemicals because of their persistence in the environment, have been linked to a wide range of serious illnesses, including some cancers. They are used in a variety of consumer products but one of their most prolific uses is in firefighting foam.",
      },
      {
        type: "paragraph",
        text: "In May 2024, Ends Report and the Guardian published an investigation revealing that groundwater in the small rural town of Bentham in North Yorkshire was contaminated with the highest level of PFAS ever known to be recorded in the UK. This was found on land belonging to Angus Fire, a factory that between 1976 and 2024 legally produced PFAS-containing firefighting foam.",
      },
      {
        type: "paragraph",
        text: "Blood testing conducted as part of a new ITV documentary that will be broadcast on Sunday night, produced in collaboration with Ends Report, has revealed that residents and former workers at the factory have “alarming” levels of these chemicals in their blood.",
      },
      {
        type: "h2",
        text: "Risk thresholds and results",
      },
      {
        type: "paragraph",
        text: "In the UK, there are no guidelines indicating what constitutes a safe level of PFAS in blood. However in the US, the National Academies of Sciences, Engineering, and Medicine (NASEM) has said that if the sum of seven PFAS chemicals in blood is above 2 ng/ml, there is a potential for adverse health effects.",
      },
      {
        type: "paragraph",
        text: "The highest PFAS level in blood recorded in Bentham was 405 ng/ml—more than 200 times greater than the US risk level of 2 ng/ml. This was recorded in the blood of a former worker at Angus Fire who has asked to remain anonymous.",
      },
      {
        type: "paragraph",
        text: "If the PFAS level in the blood is above 20 ng/ml, then NASEM says there is an increased risk of adverse effects and that clinicians should consider more frequent, targeted health screenings.",
      },
      {
        type: "paragraph",
        text: "Almost a quarter (23%) of the 39 people who underwent blood testing in Bentham had levels that place them in the highest risk category. Among them was 34-year-old Stephen Illston, who has a PFAS level of 55 ng/ml.",
      },
      {
        type: "paragraph",
        text: "Illston has had trouble conceiving children. He said his infertility problems had led to poor mental health and years when he questioned his “usefulness on the earth”.",
      },
      {
        type: "paragraph",
        text: "A growing body of research is revealing that PFAS are associated with reproductive health problems, including lower sperm count. Stephen said that finding out he had elevated PFAS in his blood was “an answer that I’ve been searching for”.",
      },
      {
        type: "paragraph",
        text: "“It’s good to hear it’s not me, maybe it’s the PFAS that’s caused it,” he said.",
      },
      {
        type: "paragraph",
        text: "Dr David Megson, a forensic environmental scientist and PFAS expert at Manchester Metropolitan University who carried out an analysis of the blood results to compare them to PFAS levels in the US population, said he was “absolutely shocked” when he saw the Bentham data. He said the levels were “exceptionally high compared to a general [US] background population”.",
      },
      {
        type: "paragraph",
        text: "“If it was just normal, we should have half the people above [and] half the people below average. [But] nearly everybody we tested was above average and two-thirds of them were in the top 5%. A third of them were higher than anything we’d ever expect to see in the background population. So that was really shocking, and quite staggering.”",
      },
      {
        type: "paragraph",
        text: "Dr Shubhi Sharma from the environmental charity Chem Trust said: “The PFAS levels in people’s blood in Bentham are alarming, especially given that these chemicals have been linked to a variety of adverse health outcomes including certain cancers.”",
      },
      {
        type: "paragraph",
        text: "An Angus Fire spokesperson said that there was “no accepted way of interpreting blood tests for PFAS internationally and there is limited agreement on the relationship between PFAS exposure, blood levels and health effects”.",
      },
      {
        type: "paragraph",
        text: "They said it was “unfounded to classify [the] blood data as ‘unusually high’ in the UK context”. They added that the blood test group in Bentham was “extremely small” and said: “While we appreciate that these findings may cause concern, having raised PFAS levels in blood is neither an indicator of health, nor of the way in which PFAS has been absorbed.”",
      },
      {
        type: "figure",
        src: GUARDIAN_BENTHAM_IMG_ALLOTMENT,
        alt: "Colourful fruit and vegetables",
        caption:
          "An internal Environment Agency report in 2024 said “aerial dispersal” from foam testing could expose residents to PFAS through “consumption of allotment produce and produce grown within private gardens”. Photograph: Jill Mead / The Guardian.",
      },
      {
        type: "h2",
        text: "Community exposure and regulation",
      },
      {
        type: "paragraph",
        text: "Dr Tony Fletcher, an epidemiologist and a world-leading PFAS expert at the London School of Hygiene and Tropical Medicine, said the fact there were a number of people in Bentham who “have high levels well above 20 ng/ml” who didn’t work at the factory suggested that “they were getting exposed in the community”.",
      },
      {
        type: "paragraph",
        text: "An internal Environment Agency report produced in 2024 suggested that airborne emissions from the factory could be a likely pathway for this exposure.",
      },
      {
        type: "paragraph",
        text: "The report states that “aerial dispersal” from foam testing at the factory could lead to PFAS exposure for site workers and exposure to residents through the “consumption of allotment produce and produce grown within private gardens”. The probability of this happening, it adds, is considered “likely”.",
      },
      {
        type: "paragraph",
        text: "Fletcher said this could be possible because during the testing of PFAS firefighting foams, the chemicals could “get up into the air”, which could then “rain down or settle some distance from the plant and then it soaks down into the ground and you either get exposed to the water or to food grown in the ground”.",
      },
      {
        type: "paragraph",
        text: "Lindsay Young, who has a PFAS level of 30 ng/ml, said test fires on the Angus Fire site were a frequent occurrence. “The siren goes off and then you know the smoke is coming in five or 10 minutes and you have to go inside. It’s huge billowing gusts of black smoke. You don’t know what’s in it, no one tells you what’s in it,” she said.",
      },
      {
        type: "paragraph",
        text: "A spokesperson for Angus Fire said that the risk in the Environment Agency report was “overstated” and said that as a manufacturer of firefighting foams, they “responsibly carry out routine fire tests to ensure our products are fit for purpose”. The firm said it had stopped testing PFAS foams in Bentham in 2022 and that former operations at Angus Fire were not the sole source of PFAS in the environment in the Bentham area.",
      },
      {
        type: "paragraph",
        text: "The Environment Agency said that the fire testing was not regulated as part of the site’s permit, and that the regulation of these fires would be the responsibility of the local council. However, North Yorkshire council said that due to the company’s connection with firefighting, the test fires were exempt from the Clean Air Act 1993, which otherwise prohibits emissions of dark smoke from trade or business premises.",
      },
      {
        type: "h2",
        text: "Clinical context and company response",
      },
      {
        type: "paragraph",
        text: "Fletcher is part of a scientific panel advising the Jersey government after private drinking water supplies in Jersey were polluted by the use of firefighting foams containing PFAS at the airport.",
      },
      {
        type: "paragraph",
        text: "The panel has advised the Jersey government that for women of childbearing age who have a PFAS level of over 10 ng/ml, or anyone with a level of over 20 ng/ml and eligible for cholesterol lowering medication, clinicians should consider prescribing colesevelam, a cholesterol drug that has been found to lower PFAS levels in the first instance, with bloodletting to be considered as a second-line offer.",
      },
      {
        type: "paragraph",
        text: "Fletcher has said that people in Bentham who have elevated PFAS in their blood and who want to reduce it could discuss these options with a physician.",
      },
      {
        type: "paragraph",
        text: "A spokesperson for Angus Fire said: “We recognise the concerns about potentially damaging environmental impacts from historical operations at our facility and regret the inconvenience and worry that this has caused in Bentham.",
      },
      {
        type: "paragraph",
        text: "“Angus Fire has been working diligently for a number of years alongside independent and industry-leading environmental consultants and the Environment Agency to establish the extent of any PFAS chemical contamination … Angus Fire has always followed guidelines as set out by the UK regulatory and health authorities. Our own understanding of these chemicals evolved at the same rate as those of the regulators.”",
      },
      {
        type: "h2",
        text: "Broadcast",
      },
      {
        type: "paragraph",
        text: "In Our Blood: The Forever Chemicals Scandal will be broadcast on ITV1 and ITVX at 10.15pm on Sunday 22 March.",
      },
      {
        type: "h2",
        text: "Source",
      },
      {
        type: "paragraph",
        text: "Read the original article on The Guardian, including any updates, corrections, and additional imagery.",
      },
      {
        type: "link",
        href: GUARDIAN_URL,
        label: "Open the original Guardian article →",
      },
    ],
  },
  "wsj-food-companies-toxin-concerns-consumers": {
    title: "Food Companies Expect More Consumers to Worry About Toxins",
    category: "Insights",
    sub: "Consumer & industrial policy",
    date: "03.18.2026",
    sections: [
      {
        type: "paragraph",
        text: "The article below follows reporting in The Wall Street Journal (mid-March 2026). Elijah W Group does not own this journalism; we set it out in full for clients who track consumer-facing risk, chemicals policy, litigation, and food-sector strategy. The WSJ’s exact wording, additional context, and updates are available to subscribers at the link below.",
      },
      {
        type: "paragraph",
        text: "Food, beverage, and restaurant companies are preparing for a sustained rise in consumer concern about trace contaminants—not only calories and sugar, but chemicals linked to packaging, processing, water, and the wider supply chain. What was once treated as a niche “clean living” conversation is, in the Journal’s account, increasingly treated as a mainstream driver of brand choice, reformulation, and capital-markets risk.",
      },
      {
        type: "figure",
        src: WSJ_TOXINS_IMG,
        alt: "Supermarket scene with fresh produce and packaged goods",
        caption:
          "Image from The Wall Street Journal’s coverage (images.wsj.net).",
      },
      {
        type: "h2",
        text: "Policy attention and the MAHA moment",
      },
      {
        type: "paragraph",
        text: "The Journal ties heightened attention in part to the Make America Healthy Again (MAHA) agenda and the profile of U.S. Health and Human Services Secretary Robert F. Kennedy Jr., arguing that debate over chemical safety has spread beyond traditional environmental circles. The reporting places food dyes, pesticide residues, and related issues alongside longer-running worries about industrial contaminants—widening the set of substances and practices that draw political and media scrutiny.",
      },
      {
        type: "h2",
        text: "What surveys cited in the story suggest",
      },
      {
        type: "paragraph",
        text: "According to survey research cited in the Journal—including work by Pew Research Center—a large majority of U.S. adults express concern about harmful chemical exposure from food, drinking water, packaging, and related sources. The piece also notes that roughly five in six respondents want government and companies to do more to ensure chemical safety and transparency, underscoring the gap between public expectation and how quickly supply chains can adapt.",
      },
      {
        type: "h2",
        text: "What companies are telling investors",
      },
      {
        type: "paragraph",
        text: "The Wall Street Journal highlights risk disclosures by major operators that treat “toxin” anxiety as a material business issue. Among the examples in the reporting are The Cheesecake Factory, Mondelez International (maker of brands such as Oreo), Texas Roadhouse, and Hershey. In filings and investor communications, such companies flag the possibility that demand could shift toward products perceived as free of certain chemicals, alongside knock-on effects on sourcing, reformulation cost, shelf life, and margins.",
      },
      {
        type: "paragraph",
        text: "The article also emphasises secondary channels of risk: supply-chain disruption if inputs or packaging must be replaced; litigation and reputational damage when contaminants become headline news; and a patchwork of new regulatory obligations as states and the federal government respond at different speeds.",
      },
      {
        type: "paragraph",
        text: "Specific themes that show up across those disclosures, in the Journal’s summary, include so-called forever chemicals (PFAS), microplastics, and heavy metals—each with different pathways into food (packaging, equipment, agricultural inputs, and the environment) and different scientific and legal contours.",
      },
      {
        type: "h2",
        text: "States, Congress, and the compliance map",
      },
      {
        type: "paragraph",
        text: "The reporting describes a busy legislative layer beneath federal rulemaking: several states have adopted or proposed measures touching PFAS, microplastics, or related substances in food contact materials or packaging. At the federal level, the Journal notes bipartisan interest in requiring a government report on health harms associated with such exposures—an example of how disclosure and evidence-gathering can precede harder national standards.",
      },
      {
        type: "paragraph",
        text: "For global food businesses, that pattern—state laboratories of regulation, investor pressure, and uneven international rules—can complicate product design and marketing claims. A formulation that satisfies one jurisdiction may still attract questions in another, or from plaintiffs’ counsel citing consumer-protection theories.",
      },
      {
        type: "h2",
        text: "Implications for brands and advisors",
      },
      {
        type: "paragraph",
        text: "The through-line for operators is strategic rather than purely technical: map realistic exposure paths across ingredients, water, equipment, and packaging; align R&D and procurement with emerging constraints before crises force reactive recalls or reformulations; and build communications that can withstand scientific uncertainty—neither over-claiming “free from” language nor dismissing legitimate questions from customers, regulators, or courts.",
      },
      {
        type: "paragraph",
        text: "For investors and boards, the Journal’s framing suggests ESG and litigation dashboards should treat chemical risk as connected to brand equity and insurance costs, not only to environmental compliance in the narrow sense. First movers on transparent testing and supplier standards may pay upfront—but may also reduce tail risk if the next news cycle targets their category.",
      },
      {
        type: "h2",
        text: "Source",
      },
      {
        type: "paragraph",
        text: "Read the original Wall Street Journal article for complete quotations, data, and any subsequent corrections or updates (subscription may apply).",
      },
      {
        type: "link",
        href: WSJ_TOXINS_URL,
        label: "Open the WSJ article →",
      },
    ],
  },
  "wapo-iran-war-global-economic-impact": {
    title: "Iran conflict and the war’s global economic impact",
    category: "Insights",
    sub: "Geopolitical risk & markets",
    date: "03.19.2026",
    sections: [
      {
        type: "paragraph",
        text: "The following summary is informed by themes commonly covered in Washington Post reporting on conflict economics. Elijah W Group does not own this journalism; we provide it for clients monitoring geopolitical risk, energy, trade, and macro spillovers. Full access to The Washington Post may require a subscription.",
      },
      {
        type: "paragraph",
        text: "Escalation involving Iran can transmit quickly through global markets: energy prices, shipping and insurance costs, currency moves, and investor sentiment often react before second-round effects hit inflation, fiscal policy, and supply chains.",
      },
      {
        type: "h2",
        text: "Energy and commodities",
      },
      {
        type: "paragraph",
        text: "Oil and gas markets typically sit in the first wave of transmission—through both actual supply disruptions and risk premia. Petrochemical-linked sectors, refined products, and power prices in import-dependent regions can move in tandem, amplifying headline inflation where pass-through to consumers is fast.",
      },
      {
        type: "figure",
        src: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
        alt: "Oil pumpjacks against a sunset sky",
        caption:
          "Illustrative image (Unsplash). Middle East tensions often reshape expectations for oil supply, inventories, and prices.",
      },
      {
        type: "h2",
        text: "Trade, shipping, and finance",
      },
      {
        type: "paragraph",
        text: "Maritime chokepoints, rerouting, and higher war-risk premiums can lift costs for goods and complicate just-in-time logistics. Financial channels matter too: widening spreads, equity drawdowns in exposed sectors, and safe-haven flows can tighten conditions even for firms without direct physical exposure.",
      },
      {
        type: "figure",
        src: "https://images.unsplash.com/photo-1494412514321-0fddb6aa3c0c?auto=format&fit=crop&w=1200&q=80",
        alt: "Shipping containers stacked at a port",
        caption:
          "Illustrative image (Unsplash). Freight, routing, and inventory decisions often adjust when conflict risk rises.",
      },
      {
        type: "h2",
        text: "What operators watch",
      },
      {
        type: "paragraph",
        text: "For decision-makers, the practical focus is scenario planning: map revenue and cost exposure by region and commodity, stress-test working capital and supplier redundancy, and align public positioning with an accurate understanding of evolving sanctions and compliance obligations.",
      },
      {
        type: "h2",
        text: "Source",
      },
      {
        type: "paragraph",
        text: "Read the Washington Post’s full coverage at the link below (subscription may apply).",
      },
      {
        type: "link",
        href: WAPO_IRAN_ECON_URL,
        label: "Open the Washington Post article →",
      },
    ],
  },
  "reuters-china-warns-vicious-cycle-middle-east-war": {
    title: "China warns of vicious cycle if Middle East war escalates",
    category: "Insights",
    sub: "Geopolitical risk & diplomacy",
    date: "03.23.2026",
    sections: [
      {
        type: "paragraph",
        text: "The following follows Reuters reporting from Beijing on 23 March 2026. Elijah W Group does not own this journalism; we present it in full for clients tracking great-power diplomacy, Gulf security, and escalation risk around the Iran conflict. Read the original on Reuters for quotations, bylines, and updates.",
      },
      {
        type: "paragraph",
        text: "BEIJING, March 23 (Reuters) — China warned that further escalation of the Middle East war could set off a vicious cycle of retaliation, deepening instability beyond the immediate battlefield and complicating any path back to diplomacy.",
      },
      {
        type: "figure",
        src: REUTERS_CHINA_MIDDLE_EAST_CYCLE_IMG,
        alt: "Chinese foreign ministry spokesperson at a regular news briefing in Beijing",
        caption:
          "China’s foreign ministry comments on Middle East tensions during a regular news briefing in Beijing. File image from Reuters coverage.",
      },
      {
        type: "paragraph",
        text: "In messaging reported by Reuters, Chinese officials framed unchecked escalation as self-reinforcing: each round of strikes or threats widens the set of targets, draws in more actors, and raises the political cost of stepping back—making de-escalation harder just when energy markets, shipping, and civilian infrastructure are already under strain.",
      },
      {
        type: "h2",
        text: "Why Beijing emphasizes a “vicious cycle”",
      },
      {
        type: "paragraph",
        text: "From China’s perspective, the risk is not only bilateral but systemic. The Persian Gulf and adjoining sea lanes carry a large share of globally traded oil and gas; disruption to terminals, refineries, or chokepoints such as the Strait of Hormuz feeds straight into inflation, fiscal stress, and food security for import-dependent economies—especially in Asia and Africa.",
      },
      {
        type: "paragraph",
        text: "Reuters notes that Chinese diplomacy has repeatedly coupled concern about military escalation with calls for restraint and dialogue. Officials argue that widening the war—whether through strikes on energy grids, reprisals against third countries, or attempts to close maritime passages—makes a political settlement more distant and invites further counter-moves.",
      },
      {
        type: "h2",
        text: "Positioning among the major powers",
      },
      {
        type: "paragraph",
        text: "China has cast itself as a proponent of political settlement and respect for sovereignty under the United Nations Charter, while urging major powers to avoid actions that could “pour oil on the fire.” That stance aligns with Beijing’s economic interests—stable sea lanes and predictable energy prices—as well as its effort to present an alternative voice to U.S.-led coalition pressure on Iran.",
      },
      {
        type: "paragraph",
        text: "The reporting situates China’s warning alongside other diplomatic tracks: envoys, mediation offers, and UN appeals on humanitarian access as conflict spillover threatens aid flows, airspace, and insurance markets well outside the Gulf.",
      },
      {
        type: "h2",
        text: "What operators and investors should watch",
      },
      {
        type: "paragraph",
        text: "For firms and portfolios, the diplomatic signal matters in two ways. First, it is a reminder that escalation scenarios are not linear—each new threshold (energy infrastructure, Gulf partners, maritime closure) can trigger a new set of sanctions, insurance exclusions, and routing costs. Second, major-power rhetoric can shift quickly from condemnation to active mediation if battlefield stalemate or economic pain creates an opening.",
      },
      {
        type: "paragraph",
        text: "Until then, Reuters’ account suggests Beijing expects markets and governments to brace for continued volatility—and for the risk of a feedback loop in which military action and economic disruption reinforce each other.",
      },
      {
        type: "h2",
        text: "Source",
      },
      {
        type: "paragraph",
        text: "Read the original Reuters article for full statements, reporter credits, and related coverage.",
      },
      {
        type: "link",
        href: REUTERS_CHINA_MIDDLE_EAST_CYCLE_URL,
        label: "Open the original Reuters article →",
      },
    ],
  },
  "reuters-trump-iran-war-oil-shield-cracking": {
    title: "Trump’s Iran war oil shield is cracking",
    category: "Insights",
    sub: "Commodities & energy markets",
    date: "03.23.2026",
    sections: [
      {
        type: "paragraph",
        text: "The following is a structured reproduction of the Reuters column published 23 March 2026 (London). Elijah W Group does not own this content; it is presented for clients tracking energy markets, geopolitical risk, and U.S. policy. This piece is commentary by Reuters Energy Columnist Ron Bousso; opinions expressed are the author’s. Read the original on Reuters for updates, graphics, and related coverage.",
      },
      {
        type: "paragraph",
        text: "LONDON, March 23 (Reuters) — U.S. President Donald Trump went into the Iran war convinced that America’s vast oil wealth would insulate the country from the kind of energy shock now battering much of the world. Four weeks into the conflict, that shield is looking fragile.",
      },
      {
        type: "figure",
        src: REUTERS_TEHRAN_REFINERY_IMG,
        alt: "Fire at Tehran oil refinery after Israeli strikes, south of Tehran, June 15, 2025",
        caption:
          "Fire following Israeli strikes on a Tehran oil refinery, south of Tehran, Iran, June 15, 2025. Majid Asgaripour / WANA (West Asia News Agency) via REUTERS.",
      },
      {
        type: "paragraph",
        text: "Trump’s wager has only partly paid off. U.S. oil prices have risen less sharply than those elsewhere since U.S.-Israeli air strikes against Iran on February 28 ignited a regional war that rapidly engulfed the Middle East’s energy infrastructure, blocking the Strait of Hormuz and cutting off roughly a fifth of global oil and gas flows.",
      },
      {
        type: "paragraph",
        text: "Brent crude, the global benchmark, has surged about 55% since late February to around $110 a barrel, while U.S. West Texas Intermediate has climbed 50% to around $99. The divergence between the two benchmarks recently hit its highest in a decade, excluding a brief spike during the COVID-19 pandemic.",
      },
      {
        type: "paragraph",
        text: "This gap reflects a structural shift in energy markets. The U.S. is now the world’s largest producer of oil and gas and exports more energy than it imports, thanks to the shale boom of the past 15 years. While U.S. refiners still import crude to optimise operations—including some Middle Eastern grades that accounted for roughly 4% of consumption last year—America’s direct exposure to the Gulf is far smaller than that of Asia or Europe.",
      },
      {
        type: "paragraph",
        text: "Asia is the most vulnerable region, relying on the Middle East for about 60% of its oil imports. The sudden disruption forced oil refiners to cut run rates and governments to roll out fuel subsidies and conservation measures at enormous economic cost. Physical crude prices for imports into the region recently soared above $150 a barrel.",
      },
      {
        type: "h2",
        text: "A shrinking buffer",
      },
      {
        type: "paragraph",
        text: "America’s relative advantage, however, is eroding fast.",
      },
      {
        type: "paragraph",
        text: "With Middle Eastern supplies constrained, buyers in Asia and Europe are increasingly turning to alternative sources—including the U.S.—for crude oil, refined fuels and natural gas. That global scramble is pulling more U.S. hydrocarbons into the international market and tightening supplies at home.",
      },
      {
        type: "paragraph",
        text: "U.S. crude exports are on track to hit a record 4.6 million barrels per day in March, according to analytics firm Kpler. Exports of refined products, mainly gasoline and diesel, are also expected to reach an all-time high of about 3.2 million bpd.",
      },
      {
        type: "paragraph",
        text: "The lesson is blunt: in interconnected oil markets, domestic abundance does not buy immunity.",
      },
      {
        type: "figure",
        src: REUTERS_CHART_US_OIL,
        alt: "Reuters graphic: U.S. oil exports trend",
        caption:
          "Reuters graphic: U.S. oil exports (from the original article).",
        fit: "contain",
      },
      {
        type: "paragraph",
        text: "U.S. gasoline pump prices have already jumped more than 30% this month and are likely to breach $4 a gallon within days, despite White House efforts to rein in prices.",
      },
      {
        type: "paragraph",
        text: "U.S. retail diesel prices crossed $5 a gallon for only the second time ever last week. Wholesale prices of the industrial fuel have surged roughly 70%, only slightly less than the near-80% rise seen in Europe, the world’s largest diesel-importing region.",
      },
      {
        type: "paragraph",
        text: "Trump has brushed off the surge, calling it a “small price to pay” for the war’s objectives. That confidence partly reflects the success of Washington’s lightning-fast intervention in Venezuela earlier this year. The capture of President Nicolas Maduro and rapid change of leadership gave the U.S. effective control over the country’s vast oil resources—an extra cushion that has so far proven insufficient.",
      },
      {
        type: "paragraph",
        text: "Whether seizing Iran’s fossil fuel riches was an implicit goal of the current offensive is unknown. But the perception that America could absorb an energy shock without severe domestic consequences almost certainly informed the Trump administration’s high-stakes military gamble in the world’s most important energy hub.",
      },
      {
        type: "figure",
        src: REUTERS_CHART_HORMUZ,
        alt: "Reuters graphic: oil exports via the Strait of Hormuz",
        caption:
          "Reuters graphic: oil exports via the Strait of Hormuz (from the original article).",
        fit: "contain",
      },
      {
        type: "h2",
        text: "Hard limits",
      },
      {
        type: "paragraph",
        text: "That calculation now looks questionable.",
      },
      {
        type: "paragraph",
        text: "U.S. shale producers, still scarred by years of boom-and-bust cycles, remain cautious about ramping up drilling despite higher prices. Labour shortages, supply-chain constraints and investor demands for capital discipline are restricting how quickly output can respond.",
      },
      {
        type: "paragraph",
        text: "Meanwhile, relief valves such as the release of inventories from strategic petroleum reserves are having only a limited impact.",
      },
      {
        type: "paragraph",
        text: "President Trump suggested on Friday the U.S. was considering winding down the war, only to threaten the following day to “obliterate” Iran’s power plants if Tehran did not fully reopen the Strait of Hormuz within 48 hours.",
      },
      {
        type: "paragraph",
        text: "The longer the Iran war drags on, the more the burden will shift onto U.S. consumers through higher fuel costs and rising inflation—with potentially serious political consequences in an election year.",
      },
      {
        type: "paragraph",
        text: "When—or whether—the Strait of Hormuz fully reopens remains unclear. Britain, France and other allies are preparing a naval mission to help defend the waterway after a public spat with Trump, but they are unlikely to intervene decisively while fighting continues.",
      },
      {
        type: "paragraph",
        text: "The reopening of Hormuz will almost certainly trigger a sharp drop in global oil prices. Middle Eastern producers will, however, need weeks to restart oilfields forced offline by the conflict. Refineries, export terminals and other infrastructure damaged in the attacks will take far longer to repair, leaving a persistent supply gap.",
      },
      {
        type: "paragraph",
        text: "Once the shooting stops, the regional price divergence will likely widen, not narrow, as U.S. supply chains from wellhead to refinery remain largely intact.",
      },
      {
        type: "paragraph",
        text: "The war will also leave a lasting risk premium on Middle Eastern oil and gas—hitting hardest the economies most dependent on the region.",
      },
      {
        type: "paragraph",
        text: "The idea that America’s oil abundance can fully shield it from global energy shocks has been tested—and found wanting.",
      },
      {
        type: "figure",
        src: REUTERS_GULF_ATTACK_MAP,
        alt: "Map of the Gulf showing energy facilities and attacks",
        caption:
          "Thomson Reuters graphic: major energy facilities targeted in the region (from the original article).",
        fit: "contain",
      },
      {
        type: "paragraph",
        text: "Most of Iran’s major energy facilities, as well as major assets in nearby countries, have been targeted.",
      },
      {
        type: "h2",
        text: "Source & attribution",
      },
      {
        type: "paragraph",
        text: "Column by Ron Bousso, Reuters Energy Columnist; editing by Marguerita Choy. Reuters notes that opinions expressed are those of the author and do not necessarily reflect the views of Reuters News, which under the Trust Principles is committed to integrity, independence, and freedom from bias.",
      },
      {
        type: "link",
        href: REUTERS_IRAN_OIL_SHIELD_URL,
        label: "Open the original Reuters article →",
      },
    ],
  },
  "reuters-central-banks-hawkish-war-inflation": {
    title: "Central banks stand ready to tackle war-led inflation",
    category: "Insights",
    sub: "Macro policy & markets",
    date: "03.19.2026",
    sections: [
      {
        type: "paragraph",
        text: "The following is a structured reproduction of Reuters reporting filed from London and Frankfurt (19 March 2026). Elijah W Group does not own this journalism; we present it for clients monitoring central banks, inflation, and geopolitical risk. Read the original on Reuters for updates and related coverage.",
      },
      {
        type: "paragraph",
        text: "LONDON/FRANKFURT, March 19 (Reuters) — Top central banks said on Thursday they stood ready to tackle any surge in inflation with tighter policy, as an escalation in the Iran war put the Middle East’s vital energy infrastructure in the line of fire and pushed fuel prices higher.",
      },
      {
        type: "figure",
        src: REUTERS_CB_IMG_POWELL,
        alt: "Jerome Powell at FOMC press conference, Federal Reserve, Washington, March 18, 2026",
        caption:
          "U.S. Federal Reserve Chair Jerome Powell at a press conference after a two-day Federal Open Market Committee meeting, Washington, D.C., March 18, 2026. Kevin Lamarque / REUTERS.",
      },
      {
        type: "paragraph",
        text: "In a rare coincidence of the monetary policy diary, central banks of the United States, Japan, Britain, Canada and the euro zone—effectively the Group of Seven (G7) nations—convened this week, as have counterparts from several emerging economies.",
      },
      {
        type: "paragraph",
        text: "After facing criticism they acted too late to tame a post-COVID jump in inflation exacerbated by the Russian invasion of Ukraine in 2022, policymakers are determined to rein in prices without derailing still-patchy economic growth—and above all to avoid a “stagflation” mix of recession and price surges.",
      },
      {
        type: "paragraph",
        text: "The U.S. Federal Reserve and the Bank of Canada on Wednesday both opted to hold interest rates steady, as did the Bank of Japan, Bank of England, European Central Bank and the central banks of Switzerland and Sweden on Thursday.",
      },
      {
        type: "paragraph",
        text: "Yet they made clear they are on alert, wary that rising energy prices could spark a wave of inflation across the wider economy if, for example, it starts to prompt higher wage demands by households fearful of losing purchasing power.",
      },
      {
        type: "paragraph",
        text: "“The war in the Middle East has made the outlook significantly more uncertain, creating upside risks for inflation and downside risks for economic growth,” the ECB said.",
      },
      {
        type: "paragraph",
        text: "In her press conference after the decision, ECB President Christine Lagarde said the euro zone was resilient and that low inflation meant it was “well positioned” to deal with what she called “a major shock that is unfolding”.",
      },
      {
        type: "paragraph",
        text: "The central bank raised its forecast for inflation this year to 2.6%—above its 2% target—and released scenarios under which inflation could fall back if the shock proved temporary but rise to 4.8% next year if disruption continued.",
      },
      {
        type: "paragraph",
        text: "In the absence of a quick resolution to the conflict, ECB policymakers are likely to start a discussion in April and possibly tighten policy at their subsequent meeting in June, three sources told Reuters on Thursday.",
      },
      {
        type: "paragraph",
        text: "Commenting on the unanimous decision by the Bank of England’s policy-making committee to keep rates on hold, BoE Governor Andrew Bailey said the bank would have to respond to a persistent impact on UK inflation.",
      },
      {
        type: "paragraph",
        text: "But he played down expectations in markets for a sharp tightening as traders priced in two 25-basis-point rate hikes by year-end, up from just one prior to the meeting.",
      },
      {
        type: "paragraph",
        text: "“I would caution against reaching any strong conclusions about us raising interest rates,” Bailey said in an interview pooled for British broadcasters. “Today we’ve given a very clear message. The right place to be is on hold.”",
      },
      {
        type: "h2",
        text: "U.S. rate hike starts to get priced in",
      },
      {
        type: "paragraph",
        text: "Marking an escalation in the war that began on February 28, Iranian strikes since Wednesday have caused extensive damage to the world’s largest gas plant in Qatar and hit other Gulf infrastructure following Israeli attacks on its own gas facilities.",
      },
      {
        type: "paragraph",
        text: "Such strikes already make it more likely that the global economy will have to grapple with longer-term damage to energy supplies.",
      },
      {
        type: "paragraph",
        text: "Federal Reserve Chairman Jerome Powell noted that quantifying the hit from higher energy prices was impossible.",
      },
      {
        type: "paragraph",
        text: "“In the near term, higher energy prices will push up overall inflation, but it is too soon to know the scope and duration of the potential effects on the economy,” Powell said after the Fed’s 11-1 decision to hold rates in the 3.50%-3.75% range.",
      },
      {
        type: "paragraph",
        text: "His reluctance to say that risks of a weakening job market posed a greater risk to the Fed’s objectives than inflation helped erase market bets on rate cuts this year and well into next.",
      },
      {
        type: "paragraph",
        text: "Financial markets on Thursday even reflected a rising chance of a Fed rate hike, though traders cautioned against taking that pricing too literally given the volatility in oil prices that has contributed to that trade. Brent futures shot up past $119 a barrel overnight, though by Thursday had eased to around $108.50.",
      },
      {
        type: "figure",
        src: REUTERS_CB_IMG_2,
        alt: "Central banking and policy, Reuters photo from article gallery",
        caption:
          "From Reuters’ coverage of G7 and major central bank decisions this week (original article gallery).",
      },
      {
        type: "paragraph",
        text: "In Tokyo, Bank of Japan Governor Kazuo Ueda said the BOJ would not rule out a near-term rate hike if the expected hit to growth from surging oil costs proves temporary and does not derail progress in durably hitting the bank’s price target.",
      },
      {
        type: "paragraph",
        text: "“We need to be mindful that recent developments come at a time when companies are already actively pushing up prices and wages, which suggests they could pass on costs more aggressively than after the war in Ukraine,” Ueda told a news conference.",
      },
      {
        type: "paragraph",
        text: "Bank of Canada Governor Tiff Macklem struck a similar note: “If energy prices stay high, we will not let their effects broaden and become persistent inflation,” he said.",
      },
      {
        type: "h2",
        text: "Growing ‘stagflation’ risk?",
      },
      {
        type: "paragraph",
        text: "Earlier this week the Reserve Bank of Australia hiked rates to a 10-month high and warned of a “material” risk to inflation from the oil price spike.",
      },
      {
        type: "paragraph",
        text: "Even Brazil’s central bank, with one of the highest rates of all major economies, opted for a cautious 25-basis-point cut to a benchmark 14.75% rate—a smaller cut than initially expected.",
      },
      {
        type: "paragraph",
        text: "On Thursday both the Swiss National Bank and Sweden’s Riksbank kept policy rates on hold, flagging uncertainty over how the war will end up impacting the economy.",
      },
      {
        type: "paragraph",
        text: "European markets fell sharply on Thursday and U.S. stock futures dipped as attacks on energy infrastructure pushed benchmark Brent oil prices above $119 a barrel.",
      },
      {
        type: "paragraph",
        text: "“This latest escalation feels like a turning point for markets because the conflict is no longer just about military headlines or Strait of Hormuz closure,” Charu Chanana, chief investment strategist at Saxo in Singapore, said.",
      },
      {
        type: "paragraph",
        text: "“It is now hitting the plumbing of the global energy system. What is unsettling markets now is the growing stagflation risk.”",
      },
      {
        type: "figure",
        src: REUTERS_CB_IMG_3,
        alt: "Markets and energy: Reuters photo from article gallery",
        caption:
          "From Reuters’ coverage of oil, equities, and policy responses (original article gallery).",
      },
      {
        type: "h2",
        text: "Source & attribution",
      },
      {
        type: "paragraph",
        text: "Reporting by Promit Mukherjee in Ottawa, Howard Schneider in Washington and Leika Kihara in Tokyo, Ann Saphir in San Francisco; writing by Dan Burns and Mark John; editing by Lincoln Feast, Shri Navaratnam, Alexandra Hudson, Andrew Heavens, Catherine Evans and Diane Craft. Reuters News is committed under the Thomson Reuters Trust Principles to integrity, independence, and freedom from bias.",
      },
      {
        type: "link",
        href: REUTERS_CENTRAL_BANKS_WAR_URL,
        label: "Open the original Reuters article →",
      },
    ],
  },
};
