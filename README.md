# Datamatrix

Module for parsing data read from 2D scanner, specially made for EMVS (European medical verification system).
Input is some variant of these codes:

Pure FNC1 Syntax
```0105000456013482210000000001[GS]172012001000001[CR]
01050004560134821000001[GS]17201200210000000001[CR]
``` 

Mixed GS1 05 syntax and german IFA / MH10.8.2 (05[GS] = 05 syntax, 06[GS] = MH10.8.2 / IFA syntax)
```
[)>[RS]05[GS]0105000456013482[RS]06[GS]S0000000001[GS]1T00001[GS]D201200[RS][EOT][CR]\
```

##Scanner setup
This module to work on client side in browser, you have to setup your scanner to send also unreadable characters.

##Voyager 1450g setup
[User manual](https://country.honeywellaidc.com/CatalogDocuments/VG1450-UG.pdf)
Page 2-17, switch on Control Character Output - this will send also unreadable characters
Page 2-3, switch to PAP124, USB Keyboard PC

##Zebra DS4308 setup
Install 123Scan configuration sw and load configuration from config folder.

