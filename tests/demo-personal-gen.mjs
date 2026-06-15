import { generateContextAwarePassword } from '../extension/modules/profilePasswordGenerator.js';

const profile = {
  firstName:     'Sanskar',
  lastName:      'Phougat',
  petName:       'Bruno',
  favoriteNumber: '7',
  customKeywords: ['cricket', 'chai'],
};
const websiteContext = {
  brand:    'Instagram',
  domain:   'instagram.com',
  keywords: ['Photo', 'Story', 'Social', 'Creative'],
};

const profileWords = ['Sanskar', 'Sans', 'Phougat', 'Phou', 'Bruno', 'Cricket', 'Chai'];

console.log('Profile: firstName=Sanskar, lastName=Phougat, petName=Bruno, favoriteNumber=7');
console.log('Site:    Instagram');
console.log('Expected profile words in output:', profileWords.join(' | '));
console.log('─'.repeat(72));

let personalHits = 0;
for (let i = 0; i < 10; i++) {
  const { password, validation, attempt } = await generateContextAwarePassword({
    profile, websiteContext,
    options: { symbols: true },
  });
  const hit = profileWords.find(w => password.toLowerCase().includes(w.toLowerCase()));
  if (hit) personalHits++;
  const tag = hit ? `[${hit}]` : '[no profile word]';
  console.log(`${String(i+1).padStart(2)}.  ${password.padEnd(36)} s=${validation.strengthScore} p=${validation.personalizedAttackScore} (att ${attempt}) ${tag}`);
}
console.log('─'.repeat(72));
console.log(`Profile word present in ${personalHits}/10 passwords`);
