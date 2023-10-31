const BLACK = "#303030";
const WHITE = "#EFEFEF";

class Chains {
    constructor(name, blockExplorerPrefix, blockExplorerPostfix, blockExplorerHasIframe, bgColor, fontColor, addrRegexPatterns, addrCaseSensitive=false) {
        this.name = name;
        this.blockExplorerPrefix = blockExplorerPrefix;
        this.blockExplorerPostfix = blockExplorerPostfix;
        this.blockExplorerHasIframe = blockExplorerHasIframe;
        this.bgColor = bgColor;
        this.fontColor = fontColor;
        this.addrRegexPatterns = addrRegexPatterns;
        this.addrCaseSensitive = addrCaseSensitive;
    }

    addDNStoRegexPatterns(suffix) {
        const regex = new RegExp(`(\\.${suffix})(\s|$)`, 'g');
        this.addrRegexPatterns.push(regex);
        return this.addrRegexPatterns.length;
    }
}

class EVM extends Chains {
    constructor(name, blockExplorerPrefix, blockExplorerPostfix, blockExplorerHasIframe, bgColor, fontColor) {
        super(
            name,
            blockExplorerPrefix,
            blockExplorerPostfix,
            blockExplorerHasIframe,
            bgColor,
            fontColor,
            [/(^|\s|:|-)((?:0x)[0-9a-fA-F]{40})(\s|$)/gi]
        );
    }
}

class Ethereum extends EVM {
    constructor() {
        super(
            "Ethereum",
            "https://etherscan.io/address/",
            "",
            true,
            "#3498DB",
            WHITE
        );
        // ENS
        this.addDNStoRegexPatterns("eth");

        // Unstoppable domains
        this.addDNStoRegexPatterns("888");
        this.addDNStoRegexPatterns("bitcoin");
        this.addDNStoRegexPatterns("blockchain");
        this.addDNStoRegexPatterns("crypto");
        this.addDNStoRegexPatterns("dao");
        this.addDNStoRegexPatterns("nft");
        this.addDNStoRegexPatterns("polygon");
        this.addDNStoRegexPatterns("wallet");
        this.addDNStoRegexPatterns("x");
        this.addDNStoRegexPatterns("zil");
    }
}

class Bitcoin extends Chains {
    constructor() {
        super(
            "Bitcoin",
            "https://explorer.btc.com/btc/address/",
            "",
            false,
            "#FD9E97",
            BLACK,
            [/(^|\s|:|-)(?:^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^(?:bc1q|bc1p)[0-9A-Za-z]{37,62}$)(\s|$)/g],
            true
        );
    }
}

class BNBChain extends EVM {
    constructor() {
        super(
            "BNBChain",
            "https://bscscan.com/address/",
            "",
            false,
            "#FFC300",
            BLACK
        );
        // Space ID
        this.addDNStoRegexPatterns("bnb");
    }
}

class Polygon extends EVM {
    constructor() {
        super(
            "Polygon",
            "https://polygonscan.com/address/",
            "",
            false,
            "#8E44AD",
            WHITE
        );
        // Unstoppable domains
        this.addDNStoRegexPatterns("888");
        this.addDNStoRegexPatterns("bitcoin");
        this.addDNStoRegexPatterns("blockchain");
        this.addDNStoRegexPatterns("crypto");
        this.addDNStoRegexPatterns("dao");
        this.addDNStoRegexPatterns("nft");
        this.addDNStoRegexPatterns("polygon");
        this.addDNStoRegexPatterns("wallet");
        this.addDNStoRegexPatterns("x");
        this.addDNStoRegexPatterns("zil");
    }
}

class Avalanche extends EVM {
    constructor() {
        super(
            "Avalanche",
            "https://snowtrace.io/address/",
            "",
            false,
            "#E74C3C",
            WHITE
        );
    }
}

class Arbitrum extends EVM {
    constructor() {
        super(
            "Arbitrum",
            "https://arbiscan.io/address/",
            "",
            false,
            "#FF69B4",
            BLACK
        );
        // Space ID
        this.addDNStoRegexPatterns("arb");
    }
}

class ArbitrumNova extends EVM {
    constructor() {
        super(
            "ArbitrumNova",
            "https://nova.arbiscan.io/address/",
            "",
            false,
            "#EC852D",
            BLACK
        );
    }
}

class Optimism extends EVM {
    constructor() {
        super(
            "Optimism",
            "https://optimistic.etherscan.io/address/",
            "",
            false,
            "#FF8C00",
            BLACK
        );
    }
}

class Tron extends Chains {
    constructor() {
        super(
            "Tron",
            "https://tronscan.org/#/address/",
            "",
            false,
            "#C53228",
            WHITE,
            [/(^|\s|:|-)((?:T)[1-9a-zA-Z]{33})(\s|$)/g],
            true
        );
    }
}

class Fantom extends EVM {
    constructor() {
        super(
            "Fantom",
            "https://ftmscan.com/address/",
            "",
            false,
            "#7D3C98",
            WHITE
        );
    }
}

class Klaytn extends EVM {
    constructor() {
        super(
            "Klaytn",
            "https://scope.klaytn.com/account/",
            "",
            false,
            "#FF6363",
            WHITE
        );
    }
}

class Rei extends EVM {
    constructor() {
        super(
            "Rei",
            "https://scan.rei.network/address/",
            "",
            false,
            "#2116E5",
            WHITE
        );
    }
}

class Gnosis extends EVM {
    constructor() {
        super(
            "Gnosis",
            "https://gnosisscan.io/address/",
            "",
            false,
            "#27AE60",
            WHITE
        );
    }
}

class Moonbeam extends EVM {
    constructor() {
        super(
            "Moonbeam",
            "https://moonscan.io/address/",
            "",
            false,
            "#53CBC8",
            BLACK
        );
    }
}

class Celo extends EVM {
    constructor() {
        super(
            "Celo",
            "https://celoscan.io/address/",
            "",
            false,
            "#FCFF52",
            BLACK
        );
    }
}

class Base extends EVM {
    constructor() {
        super(
            "Base",
            "https://basescan.org/address/",
            "",
            false,
            "#3C40C6",
            WHITE
        );
    }
}

class Linea extends EVM {
    constructor() {
        super(
            "Linea",
            "https://lineascan.build/address/",
            "",
            false,
            "#050505",
            WHITE
        );
    }
}

class Flow extends Chains {
    constructor() {
        super(
            "Flow",
            "https://flowscan.org/account/",
            "",
            false,
            "#00EF8B",
            WHITE,
            [/(^|\s|:|-)((?:0x)[0-9a-fA-F]{16})(\s|$)/gi]
        );
    }
}

class Ark extends Chains {
    constructor() {
        super(
            "Ark",
            "https://live.arkscan.io/addresses/",
            "",
            false,
            "#DE5846",
            WHITE,
            [/(^|\s|:|-)((A)[A-Za-z0-9]{33})(\s|$)/gi],
            true
        );
    }
}

class Solana extends Chains {
    constructor() {
        super(
            "Solana",
            "https://solscan.io/account/",
            "",
            false,
            "linear-gradient(to right, #00FFFF, #006666)",
            BLACK,
            [/(^|\s|:|-)(?!0x)(?:[1-9A-HJ-NP-Za-km-z]{32,44})(\s|$)/g],
            true
        );
    }
}

class Aptos extends Chains {
    constructor() {
        super(
            "Aptos",
            "https://aptoscan.com/address/",
            "",
            false,
            "#303030",
            WHITE,
            [/(^|\s|:|-)((?:0x)[0-9A-Za-z]{64})(\s|$)/g],
        );
    }
}

class Sui extends Chains {
    constructor() {
        super(
            "Sui",
            "https://suiscan.xyz/mainnet/address/",
            "",
            false,
            "#9B59B6",
            WHITE,
            [/(^|\s|:|-)((?:0x)[0-9A-Za-z]{64})(\s|$)/g],
        );
    }
}

class Near extends Chains {
    constructor() {
        super(
            "Near",
            "https://nearblocks.io/address/",
            "",
            false,
            "#DFDFDF",
            BLACK,
            [/^(?!0x)(?!bc1)(?!bnb1)[a-z0-9_-]{1}[a-z0-9_.-]{0,62}[a-z0-9_-]{1}$/g],
            true
        );
        // xxx.near is default address in near blockchain
        this.addDNStoRegexPatterns("near");
    }
}

class Aurora extends EVM {
    constructor() {
        super(
            "Aurora",
            "https://explorer.aurora.dev/address/",
            "",
            false,
            "#2ECC71",
            BLACK
        );
    }
}

class Chiliz extends EVM {
    constructor() {
        super(
            "Chiliz",
            "https://scan.chiliz.com/address/",
            "",
            false,
            "#800000",
            WHITE
        );
    }
}

class ChilizOld extends EVM {
    constructor() {
        super(
            "ChilizOld",
            "https://explorer.chiliz.com/address/",
            "",
            false,
            "#600000",
            WHITE
        );
    }
}

class Oasys extends EVM {
    constructor() {
        super(
            "Oasys",
            "https://scan.oasys.games/address/",
            "",
            false,
            "#00A84F",
            BLACK
        );
    }
}

class Wemix extends EVM {
    constructor() {
        super(
            "Wemix",
            "https://wemixscan.com/address/",
            "",
            false,
            "linear-gradient(to bottom, #FF0099, #8844FF, #0066FF)",
            WHITE
        );
    }
}

class Bora extends EVM {
    constructor() {
        super(
            "Bora",
            "https://scope.boraportal.com/address/",
            "",
            false,
            "#3361ff",
            WHITE
        );
    }
}

class ZkSyncEra extends EVM {
    constructor() {
        super(
            "ZkSyncEra",
            "https://explorer.zksync.io/address/",
            "",
            false,
            "#3EA1D4",
            WHITE
        );
    }
}

class Starknet extends Chains {
    constructor() {
        super(
            "Starknet",
            "https://starkscan.co/contract/",
            "",
            false,
            "#8A2BE2",
            WHITE,
            [/(^|\s|:|-)((?:0x)[0-9a-fA-F]{64})(\s|$)/g],
        );
        this.addDNStoRegexPatterns("stark");
    }
}

class PolygonZkEVM extends EVM {
    constructor() {
        super(
            "PolygonZkEVM",
            "https://zkevm.polygonscan.com/address/",
            "",
            false,
            "#8E44AD",
            BLACK
        );
    }
}

class Mina extends Chains {
    constructor() {
        super(
            "Mina",
            "https://minaexplorer.com/wallet/",
            "",
            false,
            "linear-gradient(to bottom, #f06, #e66465, #904e95)",
            WHITE,
            [/(^|\s|:|-)((B62)[A-Za-z0-9]{52})(\s|$)/gi],
            true
        );
    }
}

class Havah extends Chains {
    constructor() {
        super(
            "Havah",
            "https://scan.havah.io/contract/",
            "",
            false,
            "#0F8F6B",
            WHITE,
            [/(^|\s|:|-)((?:hx|cx)[0-9a-fA-F]{40})(\s|$)/gi]
        );
    }
}

class Sei extends Chains {
    constructor() {
        super(
            "Sei",
            "https://www.seiscan.app/pacific-1/accounts/",
            "",
            false,
            "#992C4B",
            WHITE,
            [/(^|\s|:|-)(sei1[0-9a-z]{38})(\s|$)/gi]
        );
    }
}

class Wax extends Chains {
    constructor() {
        super(
            "Wax",
            "https://wax.eosauthority.com/account/",
            "",
            false,
            "#FCCA44",
            BLACK,
            [/(^|\s|:|-)([1-5a-z\\.]{1,12})(\s|$)/gi],
            true
        );
    }
}

const chainClasses = {
    Ethereum,
    Bitcoin,
    BNBChain,
    Polygon,
    Avalanche,
    Arbitrum,
    ArbitrumNova,
    Optimism,
    Tron,
    Fantom,
    Klaytn,
    Rei,
    Gnosis,
    Moonbeam,
    Celo,
    Base,
    Linea,
    Flow,
    Ark,
    Solana,
    Aptos,
    Sui,
    Near,
    Aurora,
    Chiliz,
    ChilizOld,
    Oasys,
    Wemix,
    Bora,
    ZkSyncEra,
    Starknet,
    PolygonZkEVM,
    Mina,
    Havah,
    Sei,
    Wax,
};

// Function to create an instance from a string
const createInstance = (className) => {
    const classes = chainClasses;
    const Class = classes[className];
    if (!Class) { throw new Error(`No class found for ${className}`); }  
    return new Class();
}

const getValueForEachChains = (value) => {
    result = [];
    for (const chainClass of Object.values(chainClasses)) {
        result.push(new chainClass()[value]);
    }
    console.log(result);
    return result
}

window.addEventListener('load', () => {
    // Mapping object
    window.createInstance = createInstance;
    window.getValueForEachChains = getValueForEachChains;
});