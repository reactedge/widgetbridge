<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Command;

use Magento\Framework\Console\Cli;
use ReactEdge\WidgetBridge\Model\Category\FaqData;
use ReactEdge\WidgetBridge\Model\Category\FaqReader;
use ReactEdge\WidgetBridge\Model\ExportWriter;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateCategoryFaqData extends Command
{
    public const NAME = 'reactedge:category-faq:generate';

    public function __construct(
        private readonly FaqReader $faqReader,
        private readonly FaqData $faqData,
        private readonly ExportWriter $exportWriter
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName(self::NAME);
        $this->setDescription(
            'Generate the ReactEdge Category FAQ data export.'
        );

        parent::configure();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $output->writeln('Generating Category FAQ data...');
        $entries = [];

        foreach ($this->faqReader->getCategoriesWithFaq() as $category) {
            $urlKey = (string) $category->getUrlKey();

            if ($urlKey === '') {
                continue;
            }

            $dataFile = 'categories/' . strtolower($urlKey) . '.json';
            $this->exportWriter->writeProductFile(
                $this->faqData->export($category),
                'categoryfaq/' . $dataFile
            );
            $entries[] = ['key' => $urlKey, 'dataFile' => $dataFile];
        }

        $this->exportWriter->writeProductFile(
            ['entries' => $entries],
            'categoryfaq/categories.json'
        );

        $output->writeln(
            sprintf('<info>Generated FAQ data for %d categories.</info>', count($entries))
        );

        return Cli::RETURN_SUCCESS;
    }
}
