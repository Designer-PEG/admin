// utils/constants.js
export const dataSources = [
  {
    name: 'Career Subscription - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycby4kMORYTPDmHJr3iaFK05KP4CBNvDGFHub5Xr2xSiOM4BWB0GRZlIFtryUYs3395AT/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Email Subscription List - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycbxCp-x-8CKOAGxO2A_0xw09tIXWoMLVBaaPxVhtDA-30Etw8mc2Mk1auK0yPdJML74/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Consultation Emails - S. Suresh & Associates',
    url: 'https://script.google.com/macros/s/AKfycbx_EpZLawq48T5aAC8nl3qy_NIlCs0zWaQyGtZotziClOyKlpR0oHcUMsAeb76xhdKu/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Contact Form Submission - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycbxPingtSPIPmWQnzicm3MTKNEKJkAcxbY3z-ytPYm15319ZP1pAu_kh_5YvqG35CxoP/exec',
    fields: ['name', 'email', 'company', 'message']
  },
  {
    name: 'Contact Form Submission - S. Suresh & Associates',
    url: 'https://script.google.com/macros/s/AKfycbwdN3RsbBL9870hsny1l0IRzqjgi6H-565LXpbI8yEwM5Od1tRlIcohjMzf78WxC-og/exec',
    fields: ['name', 'email', 'subject', 'message']
  },
  {
    name: 'Claim Form Submission - Everest Claims and Advisory',
    url: 'https://script.google.com/macros/s/AKfycbyFSj59-mDvYA1L1qB2t7q4_bPGi8ukr_LbIMtGqhIshr9BBELC_7TOKLVHbzII_4IjsA/exec',
    fields: ['name', 'email', 'message']
  }
];

export const CACHE_KEY = 'submissions_data_cache';
export const CACHE_EXPIRY_MINUTES = 5;