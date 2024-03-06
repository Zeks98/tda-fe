import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { TdaService } from '../../services/tda/tda.service';
import { Tda } from '../../models/tda';
import { TdaSingle } from '../../models/tda-single';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-tda-processing',
  templateUrl: './tda-processing.component.html',
  styleUrl: './tda-processing.component.css'
})
export class TdaProcessingComponent implements OnInit {
  @Output() fileUploaded = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  users: Tda[] | undefined;
  files: TdaSingle[] = [];
  fileId: number = 0;
  searchTerm: string = "";
  searchTermChanged: Subject<string> = new Subject<string>();

  constructor(private excelUploadService: TdaService) { }

  ngOnInit(): void {
    this.getFiles();
    this.searchTermChanged.pipe(
      debounceTime(300), // Adjust debounce time as needed
      distinctUntilChanged()
    ).subscribe((searchTerm: string) => {
      this.searchData();
    });
  }

  getFiles() {
    this.excelUploadService.getFiles().subscribe({
      next: response => {
        if (response != null) {

          this.files = response;
        }
      }
    });
  }

  getFileById(id: string) {
    this.excelUploadService.getContentById(id).subscribe((result) => {
      this.fileId = Number.parseInt(id);
      this.users = [];
      this.users = result;
    })
  }

  onFileChange(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.excelUploadService.uploadExcel(file).subscribe((result) => {
        // this.fileUploaded.emit(result);
        this.users = result;
      });
    }
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTermChanged.next(searchTerm);
  }

  searchData(): void {
    this.excelUploadService.getFilteredContent(this.fileId, this.searchTerm).subscribe(
      (data: any[]) => {
        this.users = data;
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }

}