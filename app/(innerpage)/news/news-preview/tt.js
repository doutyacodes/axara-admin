<p>
<Card className="border-none shadow-lg w-full max-w-full md:max-w-4xl mx-auto px-2 md:px-6">
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Error Alert */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Category Select */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={formStates[selectedAge]?.category}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show in Home Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="showInHome"
          checked={formStates[selectedAge]?.showInHome}
          onCheckedChange={(checked) => updateFormState(selectedAge, 'showInHome', checked)}
        />
        <Label htmlFor="showInHome">Show in Home Page</Label>
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <Label className="md:mr-4">Title</Label>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToOriginal('title')}
              className="w-full md:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Provided Data
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToResult('title')}
              className="w-full md:w-auto"
            >
              <Zap className="w-4 h-4 mr-2" />
              Processed Result
            </Button>
          </div>
        </div>
        <Input
          value={formStates[selectedAge]?.title || ''}
          onChange={(e) => updateFormState(selectedAge, 'title', e.target.value)}
          className={`w-full ${errors[`title-${selectedAge}`] ? 'border-red-500' : ''}`}
        />
        {errors[`title-${selectedAge}`] && (
          <p className="text-red-500 text-sm">{errors[`title-${selectedAge}`]}</p>
        )}
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <Label className="md:mr-4">Description</Label>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToOriginal('description')}
              className="w-full md:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Provided Data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToResult('description')}
              className="w-full md:w-auto"
            >
              <Zap className="w-4 h-4 mr-2" />
              Processed Result
            </Button>
          </div>
        </div>
        <textarea
          value={formStates[selectedAge]?.description || ''}
          onChange={(e) => updateFormState(selectedAge, 'description', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[150px] md:min-h-[200px] ${
            errors[`description-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="Enter description"
        />
        {errors[`description-${selectedAge}`] && (
          <p className="text-red-500 text-sm">{errors[`description-${selectedAge}`]}</p>
        )}
      </div>

      {/* Word Definitions Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <h3 className="text-lg font-semibold">Word Definitions</h3>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToOriginal('wordDefinitions')}
              className="w-full md:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Provided Data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToResult('wordDefinitions')}
              className="w-full md:w-auto"
            >
              <Zap className="w-4 h-4 mr-2" />
              Processed Result
            </Button>
            <Button
              type="button"
              onClick={() => {
                const currentDefs = formStates[selectedAge]?.wordDefinitions || [];
                updateFormState(selectedAge, 'wordDefinitions', [
                  ...currentDefs,
                  { id: Date.now(), word: '', definition: '' }
                ]);
              }}
              variant="outline"
              className="w-full md:w-auto border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Definition
            </Button>
          </div>
        </div>

        {formStates[selectedAge]?.wordDefinitions?.map((def, index) => (
          <Card key={def.id} className="p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Definition {index + 1}</h4>
                    <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        const newDefs = formStates[selectedAge].wordDefinitions.filter(d => d.id !== def.id);
                        updateFormState(selectedAge, 'wordDefinitions', newDefs);
                    }}
                    className="text-gray-500 hover:text-red-500"
                    >
                    <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                    <Label>Word</Label>
                    <Input
                        value={def.word}
                        onChange={(e) => {
                        const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                            d.id === def.id ? { ...d, word: e.target.value } : d
                        );
                        updateFormState(selectedAge, 'wordDefinitions', newDefs);
                        }}
                        className="mt-1"
                        placeholder="Enter word"
                    />
                    </div>

                    <div>
                    <Label>Definition</Label>
                    <textarea
                        value={def.definition}
                        onChange={(e) => {
                        const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                            d.id === def.id ? { ...d, definition: e.target.value } : d
                        );
                        updateFormState(selectedAge, 'wordDefinitions', newDefs);
                        }}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px] mt-1"
                        placeholder="Enter definition"
                    />
                    </div>
                </div>          
            </Card>
        ))}
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <h3 className="text-lg font-semibold">Questions</h3>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRevertToResult('questions')}
              className="w-full md:w-auto"
            >
              <Zap className="w-4 h-4 mr-2" />
              Load Processed Result Questions
            </Button>
            <Button
              type="button"
              onClick={() => {
                const currentQuestions = formStates[selectedAge]?.questions || [];
                updateFormState(selectedAge, 'questions', [
                  ...currentQuestions,
                  { id: Date.now(), question: '' }
                ]);
              }}
              variant="outline"
              className="w-full md:w-auto border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {formStates[selectedAge]?.questions?.map((q, index) => (
          <Card key={q.id} className={`p-4 border ${
            errors[`questions-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Question {index + 1}</h4>
                <Button
                type="button"
                variant="ghost"
                onClick={() => {
                    const newQuestions = formStates[selectedAge].questions.filter(question => question.id !== q.id);
                    updateFormState(selectedAge, 'questions', newQuestions);
                }}
                className="text-gray-500 hover:text-red-500"
                >
                <X className="w-4 h-4" />
                </Button>
            </div>

            <Input
                value={q.question}
                onChange={(e) => {
                const newQuestions = formStates[selectedAge].questions.map(question =>
                    question.id === q.id ? { ...question, question: e.target.value } : question
                );
                updateFormState(selectedAge, 'questions', newQuestions);
                }}
                placeholder="Enter your question"
                className="w-full"
            />
          </Card>
        ))}
        {errors[`questions-${selectedAge}`] && (
          <p className="text-red-500 text-sm">{errors[`questions-${selectedAge}`]}</p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Article'
        )}
      </Button>
    </form>
  </CardContent>
</Card>

<Card className="border-none shadow-lg">
<CardContent>
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Error Alert */}
    {errors.submit && (
      <Alert variant="destructive">
        <AlertDescription>{errors.submit}</AlertDescription>
      </Alert>
    )}
    {/* Category Select */}
    <div className="space-y-2">
      <Label>Category</Label>
      <Select
        value={formStates[selectedAge]?.category}
        // onValueChange={(value) => updateFormState(selectedAge, 'category', value)}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Show in Home Checkbox */}
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="showInHome"
        checked={formStates[selectedAge]?.showInHome}
        onCheckedChange={(checked) => updateFormState(selectedAge, 'showInHome', checked)}
      />
      <Label htmlFor="showInHome">Show in Home Page</Label>
    </div>

    {/* Title Section */}
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Title</Label>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToOriginal('title')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Provided Data
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToResult('title')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Processed Result
          </Button>
        </div>
      </div>
      <Input
        value={formStates[selectedAge]?.title || ''}
        onChange={(e) => updateFormState(selectedAge, 'title', e.target.value)}
        className={errors[`title-${selectedAge}`] ? 'border-red-500' : ''}
      />
      {errors[`title-${selectedAge}`] && (
        <p className="text-red-500 text-sm">{errors[`title-${selectedAge}`]}</p>
      )}
    </div>

    {/* Similar sections for Summary, Description, Questions, and Word Definitions */}
    {/* Description Section */}
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Description</Label>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToOriginal('description')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Provided Data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToResult('description')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Processed Result
          </Button>
        </div>
      </div>
      <textarea
        value={formStates[selectedAge]?.description || ''}
        onChange={(e) => updateFormState(selectedAge, 'description', e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[200px] ${
          errors[`description-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
        }`}
        placeholder="Enter description"
      />
      {errors[`description-${selectedAge}`] && (
        <p className="text-red-500 text-sm">{errors[`description-${selectedAge}`]}</p>
      )}
    </div>

    {/* Word Definitions Section */}
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Word Definitions</h3>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToOriginal('wordDefinitions')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Provided Data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToResult('wordDefinitions')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Processed Result
          </Button>
          <Button
            type="button"
            onClick={() => {
              const currentDefs = formStates[selectedAge]?.wordDefinitions || [];
              updateFormState(selectedAge, 'wordDefinitions', [
                ...currentDefs,
                { id: Date.now(), word: '', definition: '' }
              ]);
            }}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Definition
          </Button>
        </div>
      </div>

      {formStates[selectedAge]?.wordDefinitions?.map((def, index) => (
        <Card key={def.id} className="p-4 border border-gray-200">

        </Card>
      ))}
    </div>

    {/* Questions Section */}
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRevertToResult('questions')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Load Processed Result Questions
          </Button>
          <Button
            type="button"
            onClick={() => {
              const currentQuestions = formStates[selectedAge]?.questions || [];
              updateFormState(selectedAge, 'questions', [
                ...currentQuestions,
                { id: Date.now(), question: '' }
              ]);
            }}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {formStates[selectedAge]?.questions?.map((q, index) => (
        <Card key={q.id} className={`p-4 border ${
          errors[`questions-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Question {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const newQuestions = formStates[selectedAge].questions.filter(question => question.id !== q.id);
                updateFormState(selectedAge, 'questions', newQuestions);
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Input
            value={q.question}
            onChange={(e) => {
              const newQuestions = formStates[selectedAge].questions.map(question =>
                question.id === q.id ? { ...question, question: e.target.value } : question
              );
              updateFormState(selectedAge, 'questions', newQuestions);
            }}
            placeholder="Enter your question"
            className="w-full"
          />
        </Card>
      ))}
      {errors[`questions-${selectedAge}`] && (
        <p className="text-red-500 text-sm">{errors[`questions-${selectedAge}`]}</p>
      )}
    </div>

    <Button 
      type="submit" 
      disabled={isSubmitting}
      className="w-full bg-orange-500 hover:bg-orange-600"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        'Update Article'
      )}
    </Button>
  </form>
</CardContent>
</Card></p>