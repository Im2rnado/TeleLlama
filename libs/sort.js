module.exports = {
	async Sort(cosmetics) {

		const items = [];

		const exclusive = [];
		const frozen = [];
		const lava = [];
		const legendary = [];
		const dark = [];
		const marvel = [];
		const dc = [];
		const slurp = [];
		const starwars = [];
		const icon = [];
		const shadow = [];
		const gaminglegends = [];
		const epic = [];
		const rare = [];
		const uncommon = [];
		const common = [];

		const exclusives = ["cid_313_athena_commando_m_kpopfashion", "cid_028_athena_commando_f", "cid_017_athena_commando_m", "pickaxe_id_294_candycane", "cid_113_athena_commando_m_blueace", "cid_183_athena_commando_m_modernmilitaryred", "cid_757_athena_commando_f_wildcat", "cid_174_athena_commando_f_carbidewhite", "cid_516_athena_commando_m_blackwidowrogue", "cid_441_athena_commando_f_cyberscavengerblue", "cid_342_athena_commando_m_streetracermetallic", "cid_479_athena_commando_f_davinci", "cid_434_athena_commando_f_stealthhonor", "cid_175_athena_commando_m_celestial", "cid_138_athena_commando_m_psburnout", "pickaxe_id_189_streetopsstealth", "eid_kpopdance03", "cid_114_athena_commando_f_tacticalwoodland", "glider_id_090_celestial", "glider_warthog", "cid_052_athena_commando_f_psblue", "cid_085_athena_commando_m_twitch", "pickaxe_id_077_carbidewhite", "pickaxe_id_116_celestial", "pickaxe_id_039_tacticalblack", "glider_id_056_carbidewhite", "eid_bollywood", "cid_783_athena_commando_m_aquajacket", "cid_371_athena_commando_m_speedymidnight", "spid_066_llamalaxy", "cid_296_athena_commando_m_math", "pickaxe_lockjaw", "glider_id_001", "cid_657_athena_commando_f_techopsblue", "cid_711_athena_commando_m_longshorts", "eid_playereleven", "pickaxe_id_088_psburnout", "bid_055_psburnout", "wrap_121_techopsblue", "trails_id_019_psburnout", "trails_id_059_sony2", "glider_id_013_psblue", "bid_224_techopsblue", "glider_id_067_psburnout", "pickaxe_id_464_longshortsmale", "pickaxe_id_256_techopsblue", "bid_482_longshorts", "bid_448_techopsbluefemale", "glider_id_217_longshortsmale", "bid_169_mathmale", "trails_id_091_longshorts", "cid_095_athena_commando_m_founder", "cid_096_athena_commando_f_founder", "bid_234_speedymidnight", "glider_id_131_speedymidnight", "bid_346_blackwidowrogue", "pickaxe_id_178_speedymidnight", "founderumbrella", "glider_id_137_streetopsstealth", "bid_138_celestial", "bid_521_wildcat", "vtid_389_halloween_stylec", "vtid_052_skull_trooper_redflames", "bid_288_cyberscavengerfemaleblue", "cid_619_athena_commando_f_techllama", "cid_515_athena_commando_m_barbequelarry", "founderglider", "petcarrier_013_bbqlarry", "pickaxe_id_265_barbequelarry1h", "cid_035_athena_commando_m_medieval", "cid_039_athena_commando_f_disco", "pickaxe_id_013_teslacoil", "pickaxe_id_153_roseleader", "pickaxe_id_237_warpaint", "pickaxe_id_stw001_tier_1", "pickaxe_id_stw007_basic", "cid_386_athena_commando_m_streetopsstealth", "bid_249_streetopsstealth", "glider_id_137_streetopsstealth", "pickaxe_id_189_streetopsstealth", "cid_261_athena_commando_m_raptorarcticcamo", "bid_142_raptorarcticcamo", "glider_id_074_raptorarcticcamo", "pickaxe_id_097_raptorarcticcamo"];

		for (let i = 0; i < cosmetics.length; i++) {
			const item = cosmetics[i];

			const isExlusive = exclusives.find(el => el === item.id.toLowerCase());
			if (isExlusive) {
				item.rarity.value = "exclusive";
				exclusive.push(item);
			}
			else if (item.rarity.value === "frozen") {frozen.push(item);}
			else if (item.rarity.value === "lava") {lava.push(item);}
			else if (item.rarity.value === "legendary") {legendary.push(item);}
			else if (item.rarity.value === "dark") {dark.push(item);}
			else if (item.rarity.value === "marvel") {marvel.push(item);}
			else if (item.rarity.value === "dc") {dc.push(item);}
			else if (item.rarity.value === "slurp") {slurp.push(item);}
			else if (item.rarity.value === "starwars") {starwars.push(item);}
			else if (item.rarity.value === "icon") {icon.push(item);}
			else if (item.rarity.value === "shadow") {shadow.push(item);}
			else if (item.rarity.value === "gaminglegends") {gaminglegends.push(item);}
			else if (item.rarity.value === "epic") {epic.push(item);}
			else if (item.rarity.value === "rare") {rare.push(item);}
			else if (item.rarity.value === "uncommon") {uncommon.push(item);}
			else { common.push(item); }
		}

		exclusive.forEach(el => items.push(el));
		frozen.forEach(el => items.push(el));
		dark.forEach(el => items.push(el));
		marvel.forEach(el => items.push(el));
		dc.forEach(el => items.push(el));
		slurp.forEach(el => items.push(el));
		lava.forEach(el => items.push(el));
		starwars.forEach(el => items.push(el));
		icon.forEach(el => items.push(el));
		shadow.forEach(el => items.push(el));
		gaminglegends.forEach(el => items.push(el));
		legendary.forEach(el => items.push(el));
		epic.forEach(el => items.push(el));
		rare.forEach(el => items.push(el));
		uncommon.forEach(el => items.push(el));
		common.forEach(el => items.push(el));

		return items;
	},
};