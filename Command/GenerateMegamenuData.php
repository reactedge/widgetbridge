<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Command;

use Magento\Framework\Console\Cli;
use ReactEdge\WidgetBridge\Model\ExportWriter;
use ReactEdge\WidgetBridge\Model\Megamenu\MenuData;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateMegamenuData extends Command
{
    public const NAME = 'reactedge:megamenu:generate';

    public function __construct(
        private readonly MenuData $menuData,
        private readonly ExportWriter $exportWriter,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName(self::NAME);
        $this->setDescription(
            'Generate the ReactEdge Mega Menu data export.'
        );

        parent::configure();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $output->writeln('Generating Mega Menu data...');

        $data = ['data' => $this->menuData->getMegamenuData()];

        $this->exportWriter->writeProductFile(
            $data,
            'megamenu.json'
        );

        $output->writeln(
            '<info>Mega Menu data generated.</info>'
        );

        return Cli::RETURN_SUCCESS;
    }
}
