const defaultConfig = require('./config.json');
const alphaConfig = require('./alphanet/config.json');

const env = process.env.NETWORK || 'development';

// TODO: Need better strategy to dynamically load the config
const config = () => env === 'development' ? defaultConfig : alphaConfig;

const GENESIS_ACCOUNT = {
  address: '16313739661670634666L',
  publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
  password: 'wagon stock borrow episode laundry kitten salute link globe zero feed marble',
  balance: '10000000000000000',
  encryptedSecret: 'ddbb37d465228d52a78ad13555e609750ec30e8f5912a1b8fbdb091f50e269cbcc3875dad032115e828976f0c7f5ed71ce925e16974233152149e902b48cec51d93c2e40a6c95de75c1c5a2c369e6d24',
  key: 'elephant tree paris dragon chair galaxy',
};

const ASGARD_FIXTURE = [
  {
    username: 'odin',
    passphrase: 'rigid gossip paper must comic oval distance grace rug poverty violin fiction',
    secondPassphrase: 'king of asgard',
    privateKey: 'ccc2f7ce3aff95ce681627469db5661407ef200c9bb5c5359732f4e9423702e086390844bf55cf0408d3d4d0b9436600652fb355cf05c02b98b178ab510eac30',
    publicKey: '86390844bf55cf0408d3d4d0b9436600652fb355cf05c02b98b178ab510eac30',
    address: '1365558685838935280L',
  },
  {
    username: 'thor',
    passphrase: 'negative own then fantasy eager suggest suit sure concert pink noise enrich',
    secondPassphrase: 'son of odin and god of sky',
    privateKey: 'cf58a5f912e9bed08a06d26e8ffcbd838db41709ad2edb907bec40f343974a596d013be60f6f402a56f43df88582759e2cd3c69f84fac6084d86230cfdd72c35',
    publicKey: '6d013be60f6f402a56f43df88582759e2cd3c69f84fac6084d86230cfdd72c35',
    address: '7333160697601118486L',
  },
  {
    username: 'loki',
    passphrase: 'sand pipe captain equal true comfort cactus agree yard cat gloom ceiling',
    secondPassphrase: 'son of laufey',
    privateKey: 'e5932cd514d321d85d325bb3795b7576de3e89831e781d32e8bca4c7e2a0c149ca39c9ebf5475a11e5f7961517b5c6bf02c24eef37c539b70643dedeff5a87a3',
    publicKey: 'ca39c9ebf5475a11e5f7961517b5c6bf02c24eef37c539b70643dedeff5a87a3',
    address: '11608706651047534491L',
  },
  {
    username: 'heimdall',
    passphrase: 'remove anxiety grain tiny siren only machine episode shell focus rebuild since',
    secondPassphrase: 'the watchman of the gods',
    privateKey: 'bfa9e167bc1b314e8fe18087e988f0c8d8dffc71bad0da4e2bf482aa91f40812c1c631279cfcd176fa841616a953a1ff6212ecba0c5e70da8daf11bcd59ecb83',
    publicKey: 'c1c631279cfcd176fa841616a953a1ff6212ecba0c5e70da8daf11bcd59ecb83',
    address: '4173267358433421024L',
  },
  {
    username: 'fandral',
    passphrase: 'brisk payment reunion camp ability camp place urban bulk globe noodle escape',
    secondPassphrase: 'a trio of Asgardian',
    privateKey: '6808c29e5629f554a02b5aa57cb7507c206f1f44e50abca68ff46451ca06a16e48ddba265414ad5a86a7490575231f6140f53c51e883addebe48659abc14c2db',
    publicKey: '48ddba265414ad5a86a7490575231f6140f53c51e883addebe48659abc14c2db',
    address: '13039878922597584443L',
  },
  {
    username: 'sif',
    passphrase: 'shrug crush tonight subway transfer come know pipe proud admit black hope',
    secondPassphrase: 'wife of Thor',
    privateKey: 'e1884fa2dac30046c08b442e67075b86f85e5bc42cf517aca5ea4a0f6adb892c8092a64f6c8c6e8f475d4ef97849c098f53fb9fb05d3ef47ac7d96a98cd7bff1',
    publicKey: '8092a64f6c8c6e8f475d4ef97849c098f53fb9fb05d3ef47ac7d96a98cd7bff1',
    address: '9134385595829333229L',
  },
  {
    username: 'volstagg',
    passphrase: 'lunch undo move budget artwork debate dash bind donkey skate cause seminar',
    secondPassphrase: 'a trio of Asgardian',
    privateKey: '581738ccd71cf44154f0bc2d315a6335a8257d095528b3d466702a71b5e8855389c9eb0f56e9e7c559d66e03a04e39b54a997679aca64cd5fe01cf1a78dab98d',
    publicKey: '89c9eb0f56e9e7c559d66e03a04e39b54a997679aca64cd5fe01cf1a78dab98d',
    address: '11667003467304695089L',
  },
  {
    username: 'hela',
    passphrase: 'risk loan crouch away heavy shove wish fan protect endless add month',
    secondPassphrase: 'goddess of death',
    privateKey: '63e8b8970711a56eeb3643eda4d831e985b74bbe9815d464fe29c4dc27dd7b630788649ea243aa806c278e735c03316dd33a18de839cda4f36af31462bc1aecd',
    publicKey: '0788649ea243aa806c278e735c03316dd33a18de839cda4f36af31462bc1aecd',
    address: '2549984399194325112L',
  },
  {
    username: 'hogun',
    passphrase: 'kitchen satoshi wise route neither frozen glove drift blade wrist someone exchange',
    secondPassphrase: 'a trio of Asgardian',
    privateKey: 'b02febe7af6082e40d1550a772d12d43e9f3c2ee7bd95c7150888ea889d9fd184ea57ff2c42564d16f1fd3d377370fbfcc94058e2570481953de58421f0fd2ba',
    publicKey: '4ea57ff2c42564d16f1fd3d377370fbfcc94058e2570481953de58421f0fd2ba',
    address: '3655965752658135403L',
  },
  {
    username: 'surtur',
    passphrase: 'stone vote noise library fix market drama pool bag stove spoil baby',
    secondPassphrase: 'the demon',
    privateKey: '2b39a5d54ecc307ce2304f3e2ad78cf51dc25e699baf58039740ebe87dfc85f61ee86576ac0b8cef106723e38b8f7a2589a72a91b66f8fdbcb1d3d17e3683028',
    publicKey: '1ee86576ac0b8cef106723e38b8f7a2589a72a91b66f8fdbcb1d3d17e3683028',
    address: '5430583456280663549L',
  },
  {
    username: 'laufey',
    passphrase: 'fury page cake symptom design day still add dune purpose winter tell',
    secondPassphrase: 'King of the Frost Giants',
    privateKey: '3262be3d8447269f5d7ffd65b03c5aba1fa7e5371f5ed9aec4a2eba9b7cf6ca0581e825559b520858a2744fbbaa3c91ba0d0e057ec085e7f601cdcc9a9e49079',
    publicKey: '581e825559b520858a2744fbbaa3c91ba0d0e057ec085e7f601cdcc9a9e49079',
    address: '6016851622499443131L',
  },
  {
    username: 'valkyrie',
    passphrase: 'soda welcome ball cube rule unhappy cloud jar auction spray educate ability',
    secondPassphrase: 'chooser of the slain',
    privateKey: 'd1c2650cf80699a714f6881b25f77720d6c9e30609481ddf469d89aed313aae3111bf0b7884467c646f383b1c23e98d9170b5ce54f2c5b611f5d6af766590ac5',
    publicKey: '111bf0b7884467c646f383b1c23e98d9170b5ce54f2c5b611f5d6af766590ac5',
    address: '9640332937767957332L',
  },
];

module.exports = {
  config,
  GENESIS_ACCOUNT,
  ASGARD_FIXTURE,
}
