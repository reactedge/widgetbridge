<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Command;

use Magento\Framework\Console\Cli;
use ReactEdge\WidgetBridge\Model\ExportWriter;
use ReactEdge\WidgetBridge\Model\Product\ImageGalleryResolver;
use ReactEdge\WidgetBridge\Model\Product\ProductReader;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateProductWithImageData extends Command
{
    public const NAME = 'reactedge:product-gallery:generate-index';

    public function __construct(
        private readonly ProductReader $productReader,
        private readonly ImageGalleryResolver $imageGalleryResolver,
        private readonly ExportWriter $exportWriter
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName(self::NAME);
        $this->setDescription(
            'Generate the ReactEdge Product Gallery product index.'
        );

        parent::configure();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $output->writeln('Generating Product Gallery index...');

        $collection = $this->productReader->getVisibleProducts();

        $products = [];

        foreach ($collection as $product) {
            $sku = $product->getSku();

            if (!$sku) {
                continue;
            }

            $dataFile = sprintf(
                'products/%s.json',
                strtolower($sku)
            );

            $products[] = [
                'key' => $sku,
                'dataFile' => $dataFile,
            ];

            $galleryData = $this->imageGalleryResolver->export($product);

            $this->exportWriter->writeProductFile(
                $galleryData,
                $dataFile
            );
        }

        $this->exportWriter->writeProductFile(
            ['entries' => $products],
            'products.json'
        );

        $output->writeln(
            sprintf(
                '<info>Generated index for %d products.</info>',
                count($products)
            )
        );

        return Cli::RETURN_SUCCESS;
    }

}
