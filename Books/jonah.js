// ספר יונה
let a = {
        'א': 'וַיְהִי דְּבַר יְהוָה אֶל יוֹנָה בֶן אֲמִתַּי לֵאמֹר:',
        'ב': '"קוּם לֵךְ אֶל נִינְוֵה [בירת מלכות אשור] הָעִיר הַגְּדוֹלָה וּקְרָא עָלֶיהָ [תתנבא עליה את הנבואה שאני אגיד לך כשתגיע לשם], כִּי עָלְתָה רָעָתָם [הגיע הידיעה על רשעתם הרבה] לְפָנָי".',
        'ג': "וַיָּקָם יוֹנָה לִבְרֹחַ [כדי לברוח] תַּרְשִׁישָׁה [לתרשיש, שם מקום או שם של ים] מִלִּפְנֵי יְהוָה [מלעמוד מול פני ה', מפני שפחד מלבצע את השליחות], וַיֵּרֶד יָפוֹ, וַיִּמְצָא אָנִיָּה בָּאָה תַרְשִׁישׁ, וַיִּתֵּן שְׂכָרָהּ [את התשלום על ההפלגה] וַיֵּרֶד בָּהּ [נכנס לתוך האוניה] לָבוֹא עִמָּהֶם תַּרְשִׁישָׁה מִלִּפְנֵי יְהוָה.",
        'ד': 'וַיהוָה הֵטִיל רוּחַ גְּדוֹלָה אֶל הַיָּם, וַיְהִי סַעַר [סערה] גָּדוֹל בַּיָּם, וְהָאֳנִיָּה חִשְּׁבָה לְהִשָּׁבֵר [עמדה להישבר (כביכול האוניה חשבה לעשות כך)].',
        'ה': 'וַיִּירְאוּ הַמַּלָּחִים, וַיִּזְעֲקוּ אִישׁ אֶל אֱלֹהָיו, וַיָּטִלוּ אֶת הַכֵּלִים אֲשֶׁר בָּאֳנִיָּה אֶל הַיָּם לְהָקֵל מֵעֲלֵיהֶם, וְיוֹנָה יָרַד אֶל יַרְכְּתֵי [מעמקי] הַסְּפִינָה וַיִּשְׁכַּב וַיֵּרָדַם.',
        'ו': 'וַיִּקְרַב אֵלָיו רַב הַחֹבֵל וַיֹּאמֶר לוֹ: "מַה לְּךָ נִרְדָּם [שאתה נרדם]? קוּם קְרָא אֶל אֱלֹהֶיךָ, אוּלַי יִתְעַשֵּׁת [יחזור בו ויחשוב עלינו מחשבות טובות] הָאֱלֹהִים לָנוּ וְלֹא נֹאבֵד".',
        'ז': 'וַיֹּאמְרוּ אִישׁ אֶל רֵעֵהוּ: "לְכוּ וְנַפִּילָה גוֹרָלוֹת וְנֵדְעָה בְּשֶׁלְּמִי [בעבור מי] הָרָעָה הַזֹּאת לָנוּ", וַיַּפִּלוּ גּוֹרָלוֹת, וַיִּפֹּל הַגּוֹרָל עַל יוֹנָה.',
        'ח': 'וַיֹּאמְרוּ אֵלָיו: "הַגִּידָה נָּא לָנוּ בַּאֲשֶׁר לְמִי [בגלל מי (האם אכן זה בגללך, כמו שהראו לנו הגורלות)] הָרָעָה הַזֹּאת לָנוּ? מַה מְּלַאכְתְּךָ וּמֵאַיִן תָּבוֹא? מָה אַרְצֶךָ וְאֵי מִזֶּה עַם אָתָּה?".',
        'ט': 'וַיֹּאמֶר אֲלֵיהֶם: "עִבְרִי אָנֹכִי, וְאֶת יְהוָה אֱלֹהֵי הַשָּׁמַיִם אֲנִי יָרֵא [אני עובד (כלומר, הוא האלוהים שלי)] אֲשֶׁר עָשָׂה אֶת הַיָּם [והסערה באה ממנו] וְאֶת הַיַּבָּשָׁה".',
        'י': 'וַיִּירְאוּ הָאֲנָשִׁים יִרְאָה גְדוֹלָה, וַיֹּאמְרוּ אֵלָיו: "מַה זֹּאת עָשִׂיתָ?", כִּי יָדְעוּ הָאֲנָשִׁים כִּי מִלִּפְנֵי יְהוָה הוּא בֹרֵחַ, כִּי הִגִּיד לָהֶם.',
        'יא': 'וַיֹּאמְרוּ אֵלָיו: "מַה נַּעֲשֶׂה לָּךְ וְיִשְׁתֹּק הַיָּם מֵעָלֵינוּ?, כִּי [שהרי] הַיָּם הוֹלֵךְ וְסֹעֵר!".',
        'יב': 'וַיֹּאמֶר אֲלֵיהֶם: "שָׂאוּנִי וַהֲטִילֻנִי אֶל הַיָּם וְיִשְׁתֹּק הַיָּם מֵעֲלֵיכֶם, כִּי יוֹדֵעַ אָנִי כִּי בְשֶׁלִּי [בגללי] הַסַּעַר [הסערה] הַגָּדוֹל הַזֶּה עֲלֵיכֶם".',
        'יג': 'וַיַּחְתְּרוּ הָאֲנָשִׁים [במשוטים, בניסיון אחרון לפני שזורקים את יונה לים] לְהָשִׁיב אֶל הַיַּבָּשָׁה וְלֹא יָכֹלוּ, כִּי הַיָּם הוֹלֵךְ וְסֹעֵר [ הגלים באו אליהם מכיוון היבשה ודחפו אותם לים] עֲלֵיהֶם.',
        'יד': 'וַיִּקְרְאוּ אֶל יְהוָה וַיֹּאמְרוּ: "אָנָּה יְהוָה, אַל נָא נֹאבְדָה בְּנֶפֶשׁ [בשביל שאנחנו מאבדים את נפש] הָאִישׁ הַזֶּה, וְאַל תִּתֵּן עָלֵינוּ דָּם נָקִיא [נקי], כִּי אַתָּה יְהוָה כַּאֲשֶׁר חָפַצְתָּ עָשִׂיתָ".',
        'טו': 'וַיִּשְׂאוּ אֶת יוֹנָה וַיְטִלֻהוּ אֶל הַיָּם, וַיַּעֲמֹד [וישתוק] הַיָּם מִזַּעְפּוֹ [מקצפו].',
        'טז': 'וַיִּירְאוּ הָאֲנָשִׁים יִרְאָה גְדוֹלָה אֶת יְהוָה, וַיִּזְבְּחוּ זֶבַח לַיהוָה, וַיִּדְּרוּ נְדָרִים [להקריב עוד זבחים כאשר יחזרו לחוף].'
    }

    let b = {
        'א': 'וַיְמַן  [מינה, זימן] יְהוָה דָּג גָּדוֹל לִבְלֹעַ אֶת יוֹנָה, וַיְהִי יוֹנָה בִּמְעֵי הַדָּג שְׁלֹשָׁה יָמִים וּשְׁלֹשָׁה לֵילוֹת.',
        'ב': 'וַיִּתְפַּלֵּל יוֹנָה אֶל יְהוָה אֱלֹהָיו, מִמְּעֵי הַדָּגָה.',
        'ג': 'וַיֹּאמֶר: קָרָאתִי מִצָּרָה לִי  [מהצרה שלי, ממקום צר] אֶל יְהוָה וַיַּעֲנֵנִי  [נאמר בלשון עבר, אך הכונה היא לעתיד, כבקשה], מִבֶּטֶן שְׁאוֹל  [ממעמקי הים] שִׁוַּעְתִּי [צעקתי], שָׁמַעְתָּ [ אני בטוח שתשמע את] קוֹלִי.',
        'ד': 'וַתַּשְׁלִיכֵנִי מְצוּלָה [למעמקי הים] בִּלְבַב יַמִּים [באמצע הים] וְנָהָר [ומי הנהרות] יְסֹבְבֵנִי [הקיפו אותי]. כָּל מִשְׁבָּרֶיךָ [נחשוליך, גלים גדולים] וְגַלֶּיךָ עָלַי עָבָרוּ.',
        'ה': 'וַאֲנִי אָמַרְתִּי [חשבתי, כאשר נזרקתי לים] נִגְרַשְׁתִּי [שגורשתי] מִנֶּגֶד עֵינֶיךָ [מהשגחתך. לא איכפת לך ממני יותר ואני אמות], אַךְ [אבל כשהדג בלע אותי ונשארתי בחיים מובטח לי ש-] אוֹסִיף לְהַבִּיט אֶל הֵיכַל קָדְשֶׁךָ [אזכה עוד לבקר בבית המקדש].',
        'ו': 'אֲפָפוּנִי [הקיפוני] מַיִם עַד נֶפֶשׁ [עד שכמעט נלקחה נפשי], תְּהוֹם [המים העמוקים בים] יְסֹבְבֵנִי, סוּף חָבוּשׁ לְרֹאשִׁי [הסופה שבים נמצאת על ראשי כמו כובע].',
        'ז': 'לְקִצְבֵי [לקצוות, לשורש, למרגלות ה-] הָרִים יָרַדְתִּי, הָאָרֶץ בְּרִחֶיהָ בַעֲדִי [הארץ סגרה את בריחיה (מוט המנעול) בפני, שלא אשוב לארץ יותר] לְעוֹלָם, וַתַּעַל [אבל אחרי שעזרת לי, והדג בלע אותי, אני מאמין שתעלה] מִשַּׁחַת [מבור, ממעי הדגה חַיַּי [את חיי, את עצמי], יְהוָה אֱלֹהָי.',
        'ח': 'בְּהִתְעַטֵּף [כשהתעלפה, כשהיתה חלשה] עָלַי נַפְשִׁי, אֶת יְהוָה זָכָרְתִּי, וַתָּבוֹא אֵלֶיךָ תְּפִלָּתִי אֶל הֵיכַל קָדְשֶׁךָ.',
        'ט': 'מְשַׁמְּרִים הַבְלֵי שָׁוְא [הגויים השומרים ומצפים לעזרת אליליהם], חַסְדָּם יַעֲזֹבוּ [את הבטחתם לאלילים בסופו של דבר יפרו, כיוון שיווכחו שהאלילים לא עזרו להם].',
        'י': "וַאֲנִי בְּקוֹל תּוֹדָה [בתפילת הודיה על קורבן התודה] אֶזְבְּחָה לָּךְ, אֲשֶׁר נָדַרְתִּי אֲשַׁלֵּמָה, יְשׁוּעָתָה לַיהוָה [תודה על הישועה אתן לה'].",
        'יא': 'וַיֹּאמֶר יְהוָה לַדָּג, וַיָּקֵא אֶת יוֹנָה אֶל הַיַּבָּשָׁה.'
    }

    let c = {
        'א': 'וַיְהִי דְבַר יְהוָה אֶל יוֹנָה שֵׁנִית לֵאמֹר:',
        'ב': 'קוּם לֵךְ אֶל נִינְוֵה הָעִיר הַגְּדוֹלָה, וִּקְרָא אֵלֶיהָ אֶת הַקְּרִיאָה אֲשֶׁר אָנֹכִי דֹּבֵר אֵלֶיךָ".',
        'ג': "וַיָּקָם יוֹנָה וַיֵּלֶךְ אֶל נִינְוֶה כִּדְבַר יְהוָה, וְנִינְוֵה הָיְתָה עִיר גְּדוֹלָה לֵאלֹהִים [מאוד. ויש מפרשים: עיר חשובה לאלהים, שבמלכות אשור הקב'ה רצה להעניש את ישראל ולכן היא חשובה לו (מלבי'ם), או כיון שעד עכשיו הם הלכו בדרכי ה' (אבן עזרא)] מַהֲלַךְ [מקצה לקצה (קוטר)] שְׁלֹשֶׁת יָמִים.",
        'ד': 'וַיָּחֶל [ויתחל] יוֹנָה לָבוֹא בָעִיר מַהֲלַךְ יוֹם אֶחָד [אחרי שנכנס לעיר מהלך יום אחד התחיל להכריז], וַיִּקְרָא וַיֹּאמַר: "עוֹד אַרְבָּעִים יוֹם וְנִינְוֵה נֶהְפָּכֶת".',
        'ה': 'וַיַּאֲמִינוּ אַנְשֵׁי נִינְוֵה בֵּאלֹהִים [בדברים שנאמרו בשם אלהים], וַיִּקְרְאוּ צוֹם [הכריזו על יום צום], וַיִּלְבְּשׁוּ שַׂקִּים, מִגְּדוֹלָם וְעַד קְטַנָּם.',
        'ו': 'וַיִּגַּע הַדָּבָר [הגיעה דבר הנבואה] אֶל מֶלֶך נִינְוֵה, וַיָּקָם מִכִּסְאוֹ וַיַּעֲבֵר [ויסיר] אַדַּרְתּוֹ [מעיל עליון יקר] מֵעָלָיו, וַיְכַס שַׂק וַיֵּשֶׁב עַל הָאֵפֶר.',
        'ז': 'וַיַּזְעֵק [צוה להכריז בקול צעקה] וַיֹּאמֶר בְּנִינְוֵה מִטַּעַם [בפקודת] הַמֶּלֶךְ וּגְדֹלָיו [ושריו] לֵאמֹר: "הָאָדָם וְהַבְּהֵמָה, הַבָּקָר וְהַצֹּאן, אַל יִטְעֲמוּ מְאוּמָה, אַל יִרְעוּ, וּמַיִם אַל יִשְׁתּוּ".',
        'ח': 'וְיִתְכַּסּוּ שַׂקִּים הָאָדָם וְהַבְּהֵמָה, וְיִקְרְאוּ אֶל אֱלֹהִים בְּחָזְקָה [בכל הלב], וְיָשֻׁבוּ אִישׁ מִדַּרְכּוֹ הָרָעָה וּמִן הֶחָמָס אֲשֶׁר בְּכַפֵּיהֶם [מעשי הגזל שהם עושים בידיהם].',
        'ט': 'מִי יוֹדֵעַ [אולי] יָשׁוּב וְנִחַם [יתחרט] הָאֱלֹהִים, וְשָׁב מֵחֲרוֹן אַפּוֹ וְלֹא נֹאבֵד.',
        'י': 'וַיַּרְא הָאֱלֹהִים אֶת מַעֲשֵׂיהֶם כִּי שָׁבוּ מִדַּרְכָּם הָרָעָה, וַיִּנָּחֶם הָאֱלֹהִים עַל הָרָעָה אֲשֶׁר דִּבֶּר לַעֲשׂוֹת לָהֶם, וְלֹא עָשָׂה.'
    }

    let d = {
        'א': 'וַיֵּרַע [היה הדבר רע בעיניו (שהרשעים לא נענשו על חטאיהם)] אֶל יוֹנָה רָעָה גְדוֹלָה, וַיִּחַר לוֹ.',
        'ב': 'וַיִּתְפַּלֵּל אֶל יְהוָה וַיֹּאמַר: "אָנָּה יְהוָה, הֲלוֹא זֶה דְבָרִי [זאת היתה מחשבתי] עַד הֱיוֹתִי [כאשר עוד הייתי] עַל אַדְמָתִי [בנחלתי, במקום בו דיברת אלי בהתחלה], עַל כֵּן קִדַּמְתִּי לִבְרֹחַ תַּרְשִׁישָׁה, כִּי יָדַעְתִּי כִּי אַתָּה אֵל חַנּוּן וְרַחוּם, אֶרֶךְ אַפַּיִם וְרַב חֶסֶד וְנִחָם [ומתחרט] עַל הָרָעָה.',
        'ג': 'וְעַתָּה יְהוָה, קַח נָא אֶת נַפְשִׁי מִמֶּנִּי, כִּי טוֹב מוֹתִי מֵחַיָּי". ',
        'ד': 'וַיֹּאמֶר יְהוָה: "הַהֵיטֵב חָרָה לָךְ [האם הדבר היה בעיניך לרע מאוד]?".',
        'ה': 'וַיֵּצֵא יוֹנָה מִן הָעִיר וַיֵּשֶׁב מִקֶּדֶם [ממזרח] לָעִיר, וַיַּעַשׂ לוֹ שָׁם סֻכָּה וַיֵּשֶׁב תַּחְתֶּיהָ בַּצֵּל עַד אֲשֶׁר [עד שיעברו ארבעים יום, והוא] יִרְאֶה מַה יִּהְיֶה בָּעִיר [אולי הם לא יעמדו בתשובתם והגזירה תתבצע].',
        'ו': 'וַיְמַן [ויזמן] יְהוָה אֱלֹהִים קִיקָיוֹן וַיַּעַל מֵעַל לְיוֹנָה לִהְיוֹת צֵל עַל רֹאשׁוֹ, לְהַצִּיל לוֹ מֵרָעָתוֹ [מהרעה שהיתה לו, חום השמש], וַיִּשְׂמַח יוֹנָה עַל הַקִּיקָיוֹן שִׂמְחָה גְדוֹלָה.',
        'ז': 'וַיְמַן הָאֱלֹהִים תּוֹלַעַת בַּעֲלוֹת הַשַּׁחַר לַמָּחֳרָת, וַתַּךְ [היכתה, כירסמה, חתכה] אֶת הַקִּיקָיוֹן [בגבעול] וַיִּיבָשׁ.',
        'ח': 'וַיְהִי כִּזְרֹחַ הַשֶּׁמֶשׁ וַיְמַן אֱלֹהִים רוּחַ קָדִים [רוח מזרחית חמה] חֲרִישִׁית [שקטה] וַתַּךְ [טפחה] הַשֶּׁמֶשׁ עַל רֹאשׁ יוֹנָה וַיִּתְעַלָּף, וַיִּשְׁאַל אֶת נַפְשׁוֹ לָמוּת, וַיֹּאמֶר: "טוֹב מוֹתִי מֵחַיָּי".',
        'ט': 'וַיֹּאמֶר אֱלֹהִים אֶל יוֹנָה: "הַהֵיטֵב חָרָה לְךָ עַל הַקִּיקָיוֹן?", וַיֹּאמֶר: "הֵיטֵב חָרָה לִי, עַד מָוֶת".',
        'י': 'וַיֹּאמֶר יְהוָה: "אַתָּה חַסְתָּ עַל הַקִּיקָיוֹן אֲשֶׁר לֹא עָמַלְתָּ בּוֹ וְלֹא גִדַּלְתּוֹ, שֶׁבִּן לַיְלָה [בן לילה, בלילה אחד] הָיָה וּבִן לַיְלָה אָבָד.',
        'יא': 'וַאֲנִי לֹא אָחוּס עַל נִינְוֵה הָעִיר הַגְּדוֹלָה, אֲשֶׁר יֶשׁ בָּהּ הַרְבֵּה [יותר הרבה] מִשְׁתֵּים עֶשְׂרֵה רִבּוֹ [עשרת אלפים (כלומר: 120,000)] אָדָם [אנשים פשוטים שלא מבינים שמעשיהם רעים] אֲשֶׁר לֹא יָדַע בֵּין יְמִינוֹ לִשְׂמֹאלוֹ [בין טוב לרע] וּבְהֵמָה רַבָּה [הרבה בהמות שלא מגיע להם עונש]?".'
    }

    module.exports.chapter =  [a, b, c, d];