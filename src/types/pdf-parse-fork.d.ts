declare module "pdf-parse-fork" {
  interface PDFInfo {
    Author?: string;
    Title?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    version: string;
    text: string;
  }

  function pdf(data: Buffer | Uint8Array, options?: any): Promise<PDFParseResult>;

  export default pdf;
}
