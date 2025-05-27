import { Inject, Injectable } from '@nestjs/common';
import { INJECT_THRIDWEB } from './thirdweb.client.provider';
import {
  defineChain,
  getContract,
  prepareContractCall,
  readContract,
  sendTransaction,
  ThirdwebClient,
} from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';

import { EnvService } from 'src/env/env.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ThirdwebService {
  constructor(
    @Inject(INJECT_THRIDWEB) private readonly thirdwebClient: ThirdwebClient,
    private readonly envService: EnvService,
    private readonly s3Service: S3Service,
  ) {}

  private adminAccount() {
    return privateKeyToAccount({
      client: this.thirdwebClient,
      privateKey: this.envService.get('ADMIN_WALLET'),
    });
  }

  async generateNFT(payload: any) {
    const contract = getContract({
      client: this.thirdwebClient,
      chain: defineChain(2442),
      address: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
    });
    const a = Buffer.from(
      JSON.stringify({
        description: 'idblock user approval token',
        external_url: 'https://idblock.id',
        image:
          'https://d2qilacgdmcy5c.cloudfront.net/site/thumbnail/2a592df8ff1b1a068bf4f49fc8c6bd23881a7b597572b8304da6dc5878b8c942',
        name: 'IDBLOCK NFT',
        attributes: [...payload],
      }),
    ).toString('hex');

    const data = await readContract({
      contract,
      method: 'function nextTokenIdToMint() view returns (uint256)',
      params: [],
    });
    const { url } = await this.s3Service.uploadBuffer(
      Buffer.from(a, 'hex'),
      `public/nft/${data}`,
    );

    console.log(data.toString(), '!!!!!!!!');

    const transaction = await prepareContractCall({
      contract,
      method:
        'function lazyMint(uint256 _amount, string _baseURIForTokens, bytes _data) returns (uint256 batchId)',
      params: [
        1n,
        `${url.split('/nft/').slice(0, -1).join()}/nft/`,
        `0x${Buffer.from([]).toString('hex')}`,
      ],
    });

    try {
      const { transactionHash } = await sendTransaction({
        transaction,
        account: this.adminAccount(),
      });
      return transactionHash;
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  }
}
