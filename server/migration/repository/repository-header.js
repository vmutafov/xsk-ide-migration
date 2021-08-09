const Utils = require('xsk-ide-migration/server/migration/utils');

class RepositoryHeader {

    constructor(attachmentCount, contentLength) {
        this._protocol = "repoV2";
        this._attachmentCount = attachmentCount;
        this._contentLength = contentLength;
    }


    get protocol() {
        return this._protocol;
    }


    get attachmentCount() {
        return this._attachmentCount;
    }


    get contentLength() {
        return this._contentLength;
    }


    // toBuffer() {

    //     var protocolBuffer = Buffer.alloc(6);
    //     protocolBuffer.write(this._protocol, 'utf-8');

    //     var attachmentCountBuffer = Buffer.alloc(4);
    //     attachmentCountBuffer.writeInt32LE(this._attachmentCount);

    //     var contentLengthBuffer = Buffer.alloc(4);
    //     contentLengthBuffer.writeInt32LE(this._contentLength);

    //     return Buffer.concat([protocolBuffer, attachmentCountBuffer, contentLengthBuffer]);

    // }


    static fromBuffer(buffer){
        var attachmentCountBuffer = buffer.slice(6, 10);
            
        var attachmentCount = Utils.byteArrayToInt(attachmentCountBuffer);
        
        var contentLengthBuffer = buffer.slice(10, 14);
        var contentLength = Utils.byteArrayToInt(contentLengthBuffer);
        var actualAttachmentCount = Math.round((attachmentCount)/2);
    
        return new RepositoryHeader(actualAttachmentCount, contentLength);
        
    }

}

module.exports = RepositoryHeader;
