import bcrypt from 'bcrypt';

const plain = 'abc';
const hash = '$2b$10$5nZXUQgPBhWqDxWxuG80kuBaFcbQXtYoHPwRjWK583I/YTLgPoPYi'; // paste your saved hash

bcrypt.compare(plain, hash).then((result: any) => {
  console.log('Match:', result);
});
