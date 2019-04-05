module.exports = (barc) => {

// mixed GS1 with 05 syntax and MH10.8.2 (05[GS] = 05 syntax, 06[GS] = MH10.8.2 / IFA syntax)
// [)>[RS]05[GS]0105000456013482[RS]06[GS]S0000000001[GS]1T00001[GS]D201200[RS][EOT][CR]


// pure FNC1 Syntax
// 0105000456013482210000000001[GS]172012001000001[CR]
// 01050004560134821000001[GS]17201200210000000001[CR]

  let barcodeData = {barcode_type: 'gs1'};
  barc = barc.replace(']d2', '');                              // remove ]d2
  barc = barc.replace('[CR]', '');       // remove [CR]
  barc = barc.replace('[EOT]', '');      // remove [EOT]

  // barcode cleaned from initial and end marks

  if (barc.slice(0, 3) === '[)>') {                            // RS (syntax 05 or MF10 format) format
    barc = barc.replace('[)>', '');      // cleaning start string
    let gsList = barc.split('[RS]');                  // list of GS elements (05 or 06)

    let gsItems = gsList.map(rs => {                  // rs => RS element
      if (rs.slice(3)) {
        if (rs.slice(0, 2) === '05') {  // if RS was followed by 05 => code GS-05
          barcodeData = Object.assign(barcodeData, parseGSFive(rs.slice(6))); // slice away -> 05[GS] <-
        } else {                                                              // code MH10.8.2
          barcodeData = Object.assign(barcodeData, parseGSSix(rs.slice(6)))
        }
      }
    })
  } else {                                  // if not starts with '[)>' => is pure FNC1 syntax, directly to GS-05
    barcodeData = Object.assign(barcodeData, parseGSFive(barc));
  }
  return barcodeData
};

parseGSFive = (barcFive) => {
  const gsFive = {                                            // GS1 05 Syntax
    '01': 14                                                  // GTIN
    , '21': 20                                                // SN
    , '17': 6                                                 // expiry date
    , '10': 20                                                // lot, max length, is at the and of [GS] segment
  };

  const gsFiveType = {                                        // 05 Syntax dividers
    '01': 'productcode'                                       // GTIN
    , '21': 'serial_no'                                       // SN
    , '17': 'expiration'                                      // expiry date
    , '10': 'lot'                                             // lot
  };
  let finalData = {};

  barcFive.split('[GS]').map(segment => {
    while (segment.length > 0) {
      // console.log('Segment5: ', segment);
      let dataType = segment.slice(0, 2);                     // take first two chars
      if (gsFiveType[dataType]) {                             // compare to gsFiveTypes
        segment = segment.slice(2);                           // without first two chars
        finalData[gsFiveType[dataType]] = segment.slice(0, gsFive[dataType]); // save segment to finalData
        segment = segment.slice(gsFive[dataType]);            // cut evaluated segment
      } else {
        return finalData
      }
    }
  });
  return finalData
};

parseGSSix = (barcSix) => {                                   // MH 10.8.2
  const gsSixLength = {
    '9N': 14                                                    // Product code
    , 'S': 20                                                 // SN
    , '1T': 20                                                // Lot
    , 'D': 6                                                  // expiry date
  };

  const gsSixType = {
    '9N': 'productcode'                                       // GTIN
    , 'S': 'serial_no'                                        // SN
    , '1T': 'lot'                                             // Lot
    , 'D': 'expiration'                                       // expiry date
  };

  let finalData = {};
  barcSix.split('[GS]').map(segment => {
    while (segment.length > 0) {
      if (['S', 'D'].includes(segment.slice(0, 1))) {       // first character is S or D => is SN or exp (D201200)
        let dataType = segment.slice(0, 1);                 // select data type (D)
        segment = segment.slice(1);                         // remove first character (201200)
        finalData[gsSixType[dataType]] = segment.slice(0, gsSixLength[dataType]);
                                                            // save to finalData with type description (gsSixType['D'])
        segment = segment.slice(gsSixLength[dataType]);
      } else if (['9N', '1T'].includes(segment.slice(0, 2))) {      // first characters are 9N or 1T (1T00001)
        let dataType = segment.slice(0, 2);                         // slice datatype characters (1T)
        dataType === '9N' ? finalData.barcode_type = 'ifa' : void (0);
        segment = segment.slice(2);                         // all except first two char
        // console.log(dataType, '::', segment.slice(0, gsSixLength[dataType]));
        finalData[gsSixType[dataType]] = segment.slice(0, gsSixLength[dataType]);
        segment = segment.slice(gsSixLength[dataType]);
      } else {
        return finalData
      }
    }
  });
  return finalData
};