<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Command;

use Magento\Framework\Console\Cli;
use ReactEdge\WidgetBridge\Model\Category\FeaturedData;
use ReactEdge\WidgetBridge\Model\Category\FeaturedReader;
use ReactEdge\WidgetBridge\Model\ExportWriter;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateCategoryFeaturedData extends Command
{
    public const NAME = 'reactedge:category-featured:generate';

    public function __construct(
        private readonly FeaturedReader $featuredReader,
        private readonly FeaturedData $featuredData,
        private readonly ExportWriter $exportWriter
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName(self::NAME);
        $this->setDescription(
            'Generate the ReactEdge Category Featured data export.'
        );

        parent::configure();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $output->writeln('Generating Category Featured data...');
        $entries = [];

        foreach ($this->featuredReader->getFeaturedCategories() as $category) {
            $urlKey = (string) $category->getUrlKey();

            if ($urlKey === '') {
                continue;
            }

            $dataFile = sprintf('categories/%d.json', $category->getId());
            $this->exportWriter->writeProductFile(
                $this->featuredData->export($category),
                'categoryfeatured/' . $dataFile
            );
            $entries[] = ['key' => $urlKey, 'dataFile' => $dataFile];
        }

        $this->exportWriter->writeProductFile(
            ['entries' => $entries],
            'categoryfeatured/categories.json'
        );

        $output->writeln(
            sprintf(
                '<info>Generated featured data for %d categories.</info>',
                count($entries)
            )
        );

        return Cli::RETURN_SUCCESS;
    }
}
